import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Table, message, Input, Modal, Button, Form, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { getApiList, createApp, updateApp, deleteApp } from '@/services/spark-common';
import { UserApp } from '@/types/common';
import { maskMiddleText } from '@/utils/utils';
import styles from './app-list.module.scss';
import { PlusOutlined, CopyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import useScreenWidth from "@/hooks/use-screen-width";

interface AppListProps {}

const AppListPage: React.FC<AppListProps> = () => {
  const [appList, setAppList] = useState<UserApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const { t } = useTranslation();
  const [isShowCreateAppModal, setIsShowCreateAppModal] = useState<boolean>(false); // 是否显示创建应用弹框
  const [isShowEditAppModal, setIsShowEditAppModal] = useState<boolean>(false); // 是否显示编辑应用弹框
  const [editingApp, setEditingApp] = useState<UserApp | null>(null); // 正在编辑的应用
  const [isShowDeleteModal, setIsShowDeleteModal] = useState<boolean>(false); // 是否显示删除确认弹框
  const [appToDelete, setAppToDelete] = useState<UserApp | null>(null); // 要删除的应用
  const [createAppForm] = Form.useForm(); //创建应用表单
  const [editAppForm] = Form.useForm(); //编辑应用表单
  const screenWidth = useScreenWidth();

  const appListColumns = [
    {
      title: t('appManage.appId'),
      dataIndex: 'appId',
      key: 'appId',
      render: (text: string) => {
        return <div title={text || '--'}>{text || '--'}</div>;
      },
    },
    {
      title: t('appManage.appName'),
      dataIndex: 'appName',
      key: 'appName',
      render: (text: string) => {
        return <div title={text || '--'}>{text || '--'}</div>;
      },
    },
    {
      title: t('appManage.appDescribe'),
      dataIndex: 'appDescribe',
      key: 'appDescribe',
      render: (text: string) => {
        return <div title={text || '--'}>{text || '--'}</div>;
      },
    },
    {
      title: t('appManage.apiKey'),
      dataIndex: 'appKey',
      key: 'appKey',
      render: (text: string) => {
        return (
          <div
            title={
              text
                ? maskMiddleText(text, {
                    prefixLen: 2,
                    suffixLen: 2,
                    starLen: text?.length - 4,
                  })
                : '--'
            }
          >
            {text ? (
              <Typography.Text
                copyable={{ text: text, icon: <CopyOutlined /> }}
              >
                {maskMiddleText(text, {
                  prefixLen: 2,
                  suffixLen: 2,
                  starLen: text?.length - 4,
                }) || '--'}
              </Typography.Text>
            ) : (
              '--'
            )}
          </div>
        );
      },
    },
    {
      title: t('appManage.apiSecret'),
      dataIndex: 'appSecret',
      key: 'appSecret',
      render: (text: string) => {
        return (
          <div
            title={
              text
                ? maskMiddleText(text, {
                    prefixLen: 2,
                    suffixLen: 2,
                    starLen: text?.length - 4,
                  })
                : '--'
            }
          >
            {text ? (
              <Typography.Text
                copyable={{ text: text, icon: <CopyOutlined /> }}
              >
                {maskMiddleText(text, {
                  prefixLen: 2,
                  suffixLen: 2,
                  starLen: text?.length - 4,
                }) || '--'}
              </Typography.Text>
            ) : (
              '--'
            )}
          </div>
        );
      },
    },
    {
      title: t('appManage.createTime'),
      dataIndex: 'createTime',
      key: 'createTime',
      render: (text: string) => {
        return (
          <div title={text ? dayjs(text)?.format('YYYY-MM-DD HH:mm:ss') : '--'}>
            {text ? dayjs(text)?.format('YYYY-MM-DD HH:mm:ss') : '--'}
          </div>
        );
      },
    },
    {
      title: t('releaseManagement.operation'),
      align: 'left',
      dataIndex: 'action',
      fixed: screenWidth > 1440 ? undefined : 'right',
      width: 200,
      render: (_, record: UserApp) => (
        <div className={styles.actionButtons}>
          <span 
            className={styles.editButton}
            onClick={() => handleEditApp(record)}
            style={{ marginRight: '10px' }}
          >
            {t('releaseManagement.edit')}
          </span>
          <span 
            className={styles.deleteButton}
            onClick={() => {
              setAppToDelete(record);
              setIsShowDeleteModal(true);
            }}
          >
            {t('releaseManagement.delete')}
          </span>
        </div>
      ),
    },
  ];

  const loadAppList = async () => {
    setLoading(true);
    getApiList()
      .then(data => {
        setAppList(data);
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleSubmitCreateApp = () => {
    createAppForm.validateFields().then(values => {
      createApp(values)
        .then(() => {
          message.success(t('appManage.createAppSuccess'));
          setIsShowCreateAppModal(false);
          createAppForm.resetFields();
          loadAppList();
        })
        .catch(err => {
          console.log(err);
        });
    });
  };

  const handleEditApp = (app: UserApp) => {
    setEditingApp(app);
    editAppForm.setFieldsValue({
      appName: app.appName,
      appDescribe: app.appDescribe || '',
    });
    setIsShowEditAppModal(true);
  };

  const handleSubmitEditApp = () => {
    if (!editingApp) return;
    
    editAppForm.validateFields().then(values => {
      const params = {
        ...values,
        appId: editingApp.appId,
      };
      
      setEditLoading(true);
      updateApp(params)
        .then(() => {
          message.success(t('appManage.editAppSuccess'));
          setIsShowEditAppModal(false);
          editAppForm.resetFields();
          setEditingApp(null);
          setEditLoading(false);
          loadAppList();
        })
        .catch(err => {
          console.log(err);
          setEditLoading(false);
        });
    });
  };

  const handleDeleteApp = () => {
    if (!appToDelete) return;
    deleteApp(appToDelete.appId)
      .then(() => {
        message.success(t('appManage.deleteAppSuccess'));
        setIsShowDeleteModal(false);
        setAppToDelete(null);
        loadAppList();
      })
      .catch(err => {
        console.log(err);
        setIsShowDeleteModal(false);
        setAppToDelete(null);
      });
  };

  useEffect(() => {
    loadAppList();
  }, []);

  return (
    <div className={`${styles.appListPage} page-container-inner-UI`}>
      <div className={styles.title}>
        <div className={styles.aff}>{t('sidebar.appManagement')}</div>
      </div>
      <div className={styles.tableArea}>
        <div className={styles.tableOperation}>
          <Button
            type="primary"
            onClick={() => setIsShowCreateAppModal(true)}
            style={{ height: '32px' }}
          >
            <PlusOutlined style={{ fontSize: '16px', color: '#fff' }} />{' '}
            {t('botApi.createApp')}
          </Button>
        </div>
        <Table
          className={appList?.length === 0 ? styles.noData : ''}
          loading={loading}
          dataSource={appList}
          columns={appListColumns}
          rowKey={(record: UserApp) => 'row_' + record.appId}
          scroll={{
            scrollToFirstRowOnChange: true,
            y: 'max(200px ,calc(100vh - 350px))',
          }}
          pagination={false}
        />
      </div>
      <Modal
        open={isShowCreateAppModal}
        onCancel={() => {
          setIsShowCreateAppModal(false);
          createAppForm.resetFields();
        }}
        title={t('botApi.createApp')}
        width={500}
        centered
        maskClosable={false}
        footer={[
          <Button
            onClick={() => {
              setIsShowCreateAppModal(false);
              createAppForm.resetFields();
            }}
          >
            {t('btnCancel')}
          </Button>,
          <Button
            type="primary"
            loading={loading}
            onClick={() => {
              handleSubmitCreateApp();
            }}
          >
            {t('btnOk')}
          </Button>,
        ]}
      >
        <div className={styles.createAppModal}>
          <Form
            form={createAppForm}
            name="promptForm"
            initialValues={{ remember: true }}
            autoComplete="off"
          >
            <Form.Item
              label={t('botApi.createAppName')}
              name="appName"
              rules={[
                {
                  required: true,
                  message: t('botApi.createAppNameRequired'),
                },
              ]}
              colon={false}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input placeholder={t('botApi.createAppNamePlaceholder')} />
            </Form.Item>
            <Form.Item
              label={t('botApi.createAppDesc')}
              name="appDescribe"
              rules={[
                {
                  required: true,
                  message: t('botApi.createAppDescRequired'),
                },
              ]}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input.TextArea
                placeholder={t('botApi.createAppDescPlaceholder')}
                rows={4}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
      
      {/* 编辑应用模态框 */}
      <Modal
        open={isShowEditAppModal}
        onCancel={() => {
          setIsShowEditAppModal(false);
          editAppForm.resetFields();
          setEditingApp(null);
        }}
        title={t('appManage.editApp')}
        width={500}
        centered
        maskClosable={false}
        footer={[
          <Button
            onClick={() => {
              setIsShowEditAppModal(false);
              editAppForm.resetFields();
              setEditingApp(null);
            }}
          >
            {t('btnCancel')}
          </Button>,
          <Button
            type="primary"
            loading={editLoading}
            onClick={() => {
              handleSubmitEditApp();
            }}
          >
            {t('btnOk')}
          </Button>,
        ]}
      >
        <div className={styles.createAppModal}>
          <Form
            form={editAppForm}
            name="editAppForm"
            initialValues={{ remember: true }}
            autoComplete="off"
          >
            <Form.Item
              label={t('botApi.createAppName')}
              name="appName"
              rules={[
                {
                  required: true,
                  message: t('botApi.createAppNameRequired'),
                },
              ]}
              colon={false}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input placeholder={t('botApi.createAppNamePlaceholder')} />
            </Form.Item>
            <Form.Item
              label={t('botApi.createAppDesc')}
              name="appDescribe"
              rules={[
                {
                  required: true,
                  message: t('botApi.createAppDescRequired'),
                },
              ]}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input.TextArea
                placeholder={t('botApi.createAppDescPlaceholder')}
                rows={4}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal
        open={isShowDeleteModal}
        onCancel={() => {
          setIsShowDeleteModal(false);
          setAppToDelete(null);
        }}
        title={t('releaseManagement.delete')}
        width={400}
        centered
        maskClosable={false}
        footer={[
          <Button
            onClick={() => {
              setIsShowDeleteModal(false);
              setAppToDelete(null);
            }}
          >
            {t('btnCancel')}
          </Button>,
          <Button
            type="primary"
            danger
            loading={loading}
            onClick={handleDeleteApp}
          >
            {t('btnOk')}
          </Button>,
        ]}
      >
        <div className={styles.deleteConfirmModal}>
          <p>{t('appManage.deleteConfirm')}</p>
        </div>
      </Modal>
    </div>
  );
};

export default AppListPage;
