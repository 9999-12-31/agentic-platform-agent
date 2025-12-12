import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNodeCommon } from '@/components/workflow/hooks/use-node-common';
import useFlowsManager from '@/components/workflow/store/use-flows-manager';
import Inputs from '@/components/workflow/nodes/components/inputs';
import FixedOutputs from '@/components/workflow/nodes/components/fixed-outputs';
import ExceptionHandling from '@/components/workflow/nodes/components/exception-handling';
import { FlowTemplateEditor, FLowCollapse } from '@/components/workflow/ui';

export const OssDetail = memo(({ id, data }): React.ReactElement => {
  const { handleChangeNodeParam } = useNodeCommon({ id, data });
  const { t } = useTranslation();
  const canvasesDisabled = useFlowsManager(state => state.canvasesDisabled);

  return (
    <div className="p-[14px] pb-[6px]">
      <div className="bg-[#fff] rounded-lg w-full flex flex-col gap-2.5">
        <Inputs id={id} data={data}>
          <div className="text-base font-medium">{t('workflow.nodes.common.input')}</div>
        </Inputs>
        
        <FLowCollapse
          label={
            <h4 className="text-base font-medium">{t('workflow.nodes.ossNode.ossConfig')}</h4>
          }
          content={
            <div className="rounded-md px-[18px] pb-3 pointer-events-auto">
                {/* Filename Field */}
                <div className="my-2 flex items-center justify-between">
                    <span>{t('workflow.nodes.ossNode.filename')}</span>
                </div>
                <div>
                    <FlowTemplateEditor
                    id={id}
                    data={data}
                    value={data?.nodeParam?.filename}
                    onChange={value =>
                        handleChangeNodeParam(
                        (data, value) => (data.nodeParam.filename = value),
                        value
                        )
                    }
                    placeholder={t('workflow.nodes.ossNode.filenamePlaceholder')}
                    disabled={canvasesDisabled}
                    />
                </div>
                {/* File Bytes Field */}
                <div className="my-2 flex items-center justify-between">
                    <span>{t('workflow.nodes.ossNode.fileBytes')}</span>
                </div>
                <div>
                    <FlowTemplateEditor
                    id={id}
                    data={data}
                    value={data?.nodeParam?.file_bytes}
                    onChange={value =>
                        handleChangeNodeParam(
                        (data, value) => (data.nodeParam.file_bytes = value),
                        value
                        )
                    }
                    placeholder={t('workflow.nodes.ossNode.fileBytesPlaceholder')}
                    disabled={canvasesDisabled}
                    />
                </div>
            </div>
          }
        />

        <FixedOutputs id={id} data={data} />
        <ExceptionHandling id={id} data={data} />
      </div>
    </div>
  );
});
