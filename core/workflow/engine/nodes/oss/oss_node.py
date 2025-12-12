import os
import uuid

from typing import Optional

from pydantic import Field

from workflow.engine.entities.variable_pool import VariablePool
from workflow.engine.nodes.base_node import BaseNode
from workflow.engine.nodes.entities.node_run_result import NodeRunResult
from workflow.engine.nodes.oss.s3_service import S3Service
from workflow.exception.e import CustomException
from workflow.exception.errors.err_code import CodeEnum
from workflow.extensions.otlp.trace.span import Span


class OSSNode(BaseNode):
    """
    OSS Node class for file upload to S3-compatible storage.
    
    This node provides functionality to upload files to S3-compatible object storage services
    with public read access, using the S3Service implementation.
    
    Parameters can be configured through either:
    1. Direct parameter values in the workflow definition
    2. Environment variables (OSS_ENDPOINT, OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET, OSS_BUCKET_NAME, OSS_DOWNLOAD_HOST)
    """
    
    endpoint: str = Field(
        default_factory=lambda: os.getenv("OSS_ENDPOINT", ""),
        description="S3 service endpoint URL (fallback: OSS_ENDPOINT env var)"
    )
    access_key_id: str = Field(
        default_factory=lambda: os.getenv("OSS_ACCESS_KEY_ID", ""),
        description="AWS access key ID for authentication (fallback: OSS_ACCESS_KEY_ID env var)"
    )
    access_key_secret: str = Field(
        default_factory=lambda: os.getenv("OSS_ACCESS_KEY_SECRET", ""),
        description="AWS secret access key for authentication (fallback: OSS_ACCESS_KEY_SECRET env var)"
    )
    bucket_name: str = Field(
        default_factory=lambda: os.getenv("OSS_BUCKET_NAME", ""),
        description="Default bucket name for file operations (fallback: OSS_BUCKET_NAME env var)"
    )
    oss_download_host: str = Field(
        default_factory=lambda: os.getenv("OSS_DOWNLOAD_HOST", ""),
        description="Host URL for generating download links (fallback: OSS_DOWNLOAD_HOST env var)"
    )
    
    async def async_execute(
        self,
        variable_pool: VariablePool,
        span: Span,
        **kwargs,
    ) -> NodeRunResult:
        """
        Execute file upload to S3-compatible storage asynchronously.
        
        :param variable_pool: Pool containing workflow variables
        :param span: Tracing span for monitoring and debugging
        :param kwargs: Additional keyword arguments
        :return: NodeRunResult containing execution results
        """
        try:
            # Get input parameters from variable pool
            inputs = {}
            filename = None
            file_bytes = None
            
            # Extract filename and file_bytes from input_identifier
            for input_key in self.input_identifier:
                value = variable_pool.get_variable(
                    node_id=self.node_id, key_name=input_key, span=span
                )
                inputs[input_key] = value
                
                # Identify filename and file_bytes parameters
                if input_key == 'filename':
                    filename = value
                elif input_key == 'file_bytes':
                    file_bytes = value
            
            # Validate required parameters
            if not filename or not file_bytes:
                raise CustomException(
                    err_code=CodeEnum.PARAM_ERROR,
                    err_msg="filename and file_bytes are required parameters",
                    cause_error="Missing required parameters"
                )
            
            # Generate random filename if only extension is provided
            if isinstance(filename, str) and filename.startswith('.'):
                # Generate random UUID and append the extension
                filename = f"{uuid.uuid4().hex}{filename}"
            
            # Convert file_bytes to bytes if it's a string
            if isinstance(file_bytes, str):
                file_bytes = file_bytes.encode('utf-8')
            elif not isinstance(file_bytes, bytes):
                raise CustomException(
                    err_code=CodeEnum.PARAM_ERROR,
                    err_msg="file_bytes must be either string or bytes type",
                    cause_error=f"Invalid type: {type(file_bytes).__name__}"
                )
            
            # Create S3Service instance
            s3_service = S3Service(
                endpoint=self.endpoint,
                access_key_id=self.access_key_id,
                access_key_secret=self.access_key_secret,
                bucket_name=self.bucket_name,
                oss_download_host=self.oss_download_host,
            )
            
            # Upload file
            download_url = s3_service.upload_file(filename, file_bytes)
            
            # Prepare output
            outputs = {}
            for output_key in self.output_identifier:
                if output_key == 'download_url':
                    outputs[output_key] = download_url
                else:
                    # If output key is not download_url, use the corresponding input value
                    outputs[output_key] = inputs.get(output_key, None)
            
            return self.success(inputs=inputs, outputs=outputs)
            
        except Exception as e:
            # Handle exceptions and return failure result
            return self.fail(e, CodeEnum.FILE_STORAGE_ERROR, span)