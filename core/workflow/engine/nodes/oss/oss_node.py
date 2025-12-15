import os
import uuid
from typing import Optional, Dict, Any

from pydantic import Field

from workflow.engine.entities.variable_pool import VariablePool
from workflow.engine.nodes.base_node import BaseNode
from workflow.engine.nodes.entities.node_run_result import NodeRunResult
from workflow.engine.nodes.oss.s3_service import S3Service
from workflow.exception.e import CustomException
from workflow.exception.errors.err_code import CodeEnum
from workflow.extensions.otlp.trace.span import Span
from workflow.utils.prompt_template_replace import prompt_template_replace


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
    download_host: str = Field(
        default_factory=lambda: os.getenv("OSS_DOWNLOAD_HOST", ""),
        description="Host URL for generating download links (fallback: OSS_DOWNLOAD_HOST env var)"
    )
    file_extension: str = Field(
        default_factory=lambda: "txt", 
        description="File extension for uploaded files"
    )
    file_name: str = Field(
        default_factory=lambda: f"{uuid.uuid4()}.{{file_extension}}",
        description="File name for uploaded files"
    )
    file_content: str = Field(
        default_factory=lambda: "hello world",
        description="Content of the uploaded file"
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
            inputs: Dict[str, Any] = {}
            
            # Initialize parameters with class defaults
            endpoint = self.endpoint
            access_key_id = self.access_key_id
            access_key_secret = self.access_key_secret
            bucket_name = self.bucket_name
            download_host = self.download_host
            
            # Extract filename and file_bytes from input_identifier
            for input_key in self.input_identifier:
                value = variable_pool.get_variable(
                    node_id=self.node_id, key_name=input_key, span=span
                )
                inputs[input_key] = value
                
                # Override parameters if provided in input
                if input_key == 'oss_endpoint':
                    endpoint = value
                elif input_key == 'oss_access_key_id':
                    access_key_id = value
                elif input_key == 'oss_access_key_secret':
                    access_key_secret = value
                elif input_key == 'oss_bucket_name':
                    bucket_name = value
                elif input_key == 'oss_download_host':
                    download_host = value

            file_name = prompt_template_replace(
                    input_identifier=self.input_identifier,
                    _prompt_template=self.file_name,
                    node_id=self.node_id,
                    variable_pool=variable_pool,
                    span_context=span,
                )
                
            file_content = prompt_template_replace(
                    input_identifier=self.input_identifier,
                    _prompt_template=self.file_content,
                    node_id=self.node_id,
                    variable_pool=variable_pool,
                    span_context=span,
                )
            # 提取文件扩展名，如果不存在就使用默认扩展名
            _, ext = os.path.splitext(file_name)
            # 如果没有扩展名或扩展名是空的，使用默认扩展名
            if not ext:
                # 确保默认扩展名以点开头
                file_extension = f".{self.file_extension}" if not self.file_extension.startswith('.') else self.file_extension
                file_name = f"{file_name}{file_extension}"
            elif not ext.startswith('.'):
                # 如果扩展名存在但没有点，添加点
                file_name = f"{os.path.splitext(file_name)[0]}.{ext}"
            
            # Create S3Service instance
            s3_service = S3Service(
                endpoint=endpoint,
                access_key_id=access_key_id,
                access_key_secret=access_key_secret,
                bucket_name=bucket_name,
                oss_download_host=download_host,
            )
            
            # Upload file
            file_bytes = file_content.encode('utf-8') if isinstance(file_content, str) else file_content
            file_url = s3_service.upload_file(file_name, file_bytes)
            
            # Prepare output
            output_mapping = {
                'file_url': file_url,
                'file_name': file_name
            }
            outputs = {}
            for output_key in self.output_identifier:
                outputs[output_key] = output_mapping.get(output_key, inputs.get(output_key, None))
            
            return self.success(inputs=inputs, outputs=outputs)
            
        except Exception as e:
            # Handle exceptions and return failure result
            return self.fail(e, CodeEnum.FILE_STORAGE_ERROR, span)