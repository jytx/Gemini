<style lang="less">
  @import '../../styles/common.less';
  @import '../../styles/table.less';
</style>
<template>
  <div>
    <Row>
      <Card>
        <p slot="title">
          <Icon type="md-person"></Icon>
          我的工单
        </p>
        <Form inline ref="queryForm">
          <FormItem>
            <Input placeholder="工单说明" v-model="find.text" @on-keyup.enter="queryData"></Input>
          </FormItem>
          <FormItem>
            <DatePicker format="yyyy-MM-dd HH:mm" type="datetimerange" placeholder="请选择查询的时间范围"
                        v-model="find.picker" @on-change="find.picker=$event" style="width: 250px"
                        :editable="false"></DatePicker>
          </FormItem>
          <FormItem>
            <Button type="success" @click="queryData">查询</Button>
          </FormItem>
          <FormItem>
            <Button type="primary" @click="queryCancel">重置</Button>
          </FormItem>
        </Form>
        <Row>
          <Col span="24">
            <Table border :columns="columnsName" :data="table_data" stripe size="small">
              <template slot-scope="{ row }" slot="action">
                <div>
                  <Button type="success" @click="open_modal(row)" size="small" ghost
                          class="margin-left-10">
                    工单信息
                  </Button>
                  <Button type="warning" @click="openOrder(row)" size="small" v-if="row.Status !== 2" ghost
                          class="margin-left-10">
                    执行信息
                  </Button>
                  <Poptip
                          confirm
                          title="确定要撤销工单吗？"
                          @on-ok="delOrder(row)"
                          transfer>
                    <Button type="primary" v-if="row.Status === 2" ghost size="small" class="margin-left-10">工单撤销</Button>
                  </Poptip>
                  <Button type="error" @click="orderReject(row)" v-if="row.Status === 0" size="small" ghost class="margin-left-10">驳回理由
                  </Button>
                </div>
              </template>
            </Table>
          </Col>
        </Row>
        <br>
        <Page :total="page_number" show-elevator @on-change="currentpage" :page-size="20" ref="page"></Page>
      </Card>
    </Row>
    <Modal v-model="openModal" width="1000">
      <p slot="header" style="color:#f60;font-size: 16px">
        <Icon type="information-circled"></Icon>
        <span>SQL工单详细信息</span>
      </p>
      <Form label-position="right">
        <FormItem label="环境:">
          <span>{{ formitem.IDC }}</span>
        </FormItem>
        <FormItem label="连接名称:">
          <span>{{ formitem.Source }}</span>
        </FormItem>
        <FormItem label="数据库库名:">
          <span>{{ formitem.DataBase }}</span>
        </FormItem>
        <FormItem label="数据库表名:">
          <span>{{ formitem.Table }}</span>
        </FormItem>
        <FormItem label="定时执行:">
          <span>{{ formitem.Delay }}</span>
        </FormItem>
        <FormItem label="工单说明:">
          <span>{{ formitem.Text }}</span>
        </FormItem>
        <FormItem>
          <Table :columns="sql_columns" :data="sql" :max-height="300"></Table>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
<script>
    //
    import axios from 'axios'

    export default {
        name: 'put',
        data() {
            return {
                openModal: false,
                columnsName: [
                    {
                        title: '工单编号:',
                        key: 'WorkId',
                        sortable: true
                    },
                    {
                        title: '工单说明',
                        key: 'Text',
                        tooltip: true
                    },
                    {
                        title: '是否备份',
                        key: 'Backup'
                    },
                    {
                        title: '提交时间:',
                        key: 'Date',
                        sortable: true
                    },
                    {
                        title: '审核/执行人',
                        key: 'Assigned',
                        sortable: true
                    },
                    {
                        title: '多级审核执行人',
                        key: 'Executor',
                        sortable: true
                    },
                    {
                        title: '状态',
                        key: 'Status',
                        render: (h, params) => {
                            const row = params.row
                            let color = ''
                            let text = ''
                            if (row.Status === 2) {
                                color = 'primary'
                                text = '待审核'
                            } else if (row.Status === 0) {
                                color = 'error'
                                text = '驳回'
                            } else if (row.Status === 1) {
                                color = 'success'
                                text = '已执行'
                            } else if (row.Status === 4) {
                                color = 'error'
                                text = '执行失败'
                            } else if (row.Status === 5) {
                                color = 'primary'
                                text = '待执行'
                            } else {
                                color = 'warning'
                                text = '执行中'
                            }

                            return h('Tag', {
                                props: {
                                    type: 'dot',
                                    color: color
                                }
                            }, text)
                        },
                        sortable: true
                    },
                    {
                        title: '操作',
                        key: 'action',
                        align: 'center',
                        slot: 'action',
                        width: 250
                    }
                ],
                page_number: 1,
                computer_room: this.$config.computer_room,
                table_data: [],
                find: {
                    picker: [],
                    valve: false,
                    text: ''
                },
                multi: false,
                formitem: {},
                sql: [],
                sql_columns: [
                    {
                        title: 'sql',
                        key: 'SQL'
                    }
                ]
            }
        },
        methods: {
            open_modal(vl) {
                axios.get(`${this.$config.url}/fetch/sql?k=${vl.WorkId}`)
                    .then(res => {
                        this.sql = res.data
                    })
                    .catch(err => this.$config.err_notice(this, err));
                this.openModal = true;
                this.formitem = vl
            },
            currentpage(vl = 1) {
                axios.put(`${this.$config.url}/user/order`, {
                    page: vl,
                    find: this.find
                })
                    .then(res => {
                        if (!res.data.multi) {
                            for (let i = 0; i < this.columnsName.length; i++) {
                                if (this.columnsName[i].key === 'Executor') {
                                    this.columnsName.splice(i, 1)
                                }
                            }
                        }
                        this.table_data = res.data.data;
                        this.table_data.forEach((item) => {
                            (item.Backup === 1) ? item.Backup = '是' : item.Backup = '否'
                        })
                        this.page_number = parseInt(res.data.page)
                    })
                    .catch(error => {
                        this.$config.err_notice(this, error)
                    })
            },
            queryData() {
                this.find.valve = true
                this.currentpage()
            },
            queryCancel() {
                this.find = this.$config.clearPicker(this.find);
                this.$refs.page.currentPage = 1;
                this.currentpage()
            },
            openOrder(row) {
                this.$router.push({
                    name: 'orderlist',
                    query: {
                        workid: row.WorkId,
                        status: row.Status
                    }
                })
            },
            orderReject(row) {
                this.$Modal.error({
                    title: '驳回理由',
                    content: row.Rejected
                })
            },
            delOrder(row) {
                axios.get(`${this.$config.url}/fetch/undo?work_id=${row.WorkId}`)
                    .then(res => {
                        this.$config.notice(res.data);
                        this.currentpage(this.$refs.page.currentPage)
                    })
                    .catch(error => {
                        this.$config.err_notice(this, error)
                    })
            }
        },
        mounted() {
            this.currentpage()
        }
    }
</script>
<!-- remove delete request -->
