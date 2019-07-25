<template>
  <div>
    <Row>
      <Card>
        <p slot="title">
          <Icon type="md-person"></Icon>
          权限审核
        </p>
        <Row>
          <Col span="24">
            <Table border :columns="permissoncolums" :data="permissondata" stripe></Table>
            <br>
            <Page :total="per_pn" show-elevator @on-change="permisson_list" :page-size="20" ref="perpage"></Page>
          </Col>
        </Row>
      </Card>
    </Row>

    <Modal v-model="editInfodModal" :width="800">
      <h3 slot="header" style="color:#2D8CF0">权限申请单</h3>
      <Form :label-width="120" label-position="top">
        <template>
          <FormItem label="DDL及索引权限:">
            <RadioGroup v-model="perList.ddl">
              <Radio label="1">是</Radio>
              <Radio label="0">否</Radio>
            </RadioGroup>
          </FormItem>
          <template v-if="perList.ddl !== '0'">
            <FormItem label="连接名:">
              <CheckboxGroup v-model="perList.ddl_source">
                <Checkbox v-for="i in connectionList" :label="i.Source" :key="i.Source">
                  <Tag color="purple" :key="i.Source"> {{i.Source}}</Tag>
                </Checkbox>
              </CheckboxGroup>
            </FormItem>
          </template>
          <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
          <br>
          <FormItem label="DML权限:">
            <RadioGroup v-model="perList.dml">
              <Radio label="1">是</Radio>
              <Radio label="0">否</Radio>
            </RadioGroup>
          </FormItem>
          <template v-if="perList.dml === '1'">
            <FormItem label="连接名:">
              <CheckboxGroup v-model="perList.dml_source">
                <Checkbox v-for="i in connectionList" :label="i.Source" :key="i.Source">
                  <Tag color="geekblue" :key="i.Source"> {{i.Source}}</Tag>
                </Checkbox>
              </CheckboxGroup>
            </FormItem>
          </template>
          <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
          <br>
          <FormItem label="数据查询权限:">
            <RadioGroup v-model="perList.query">
              <Radio label="1">是</Radio>
              <Radio label="0">否</Radio>
            </RadioGroup>
          </FormItem>
          <template v-if="perList.query === '1'">
            <FormItem label="连接名:">
              <CheckboxGroup v-model="perList.query_source">
                <Checkbox v-for="i in query_list" :label="i.Source" :key="i.Source">
                  <Tag color="geekblue" :key="i.Source"> {{i.Source}}</Tag>
                </Checkbox>
              </CheckboxGroup>
            </FormItem>
          </template>
          <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
        </template>
        <FormItem label="上级审核人范围:">
          <CheckboxGroup v-model="perList.auditor">
            <Checkbox v-for="i in auditor" :label="i.Username" :key="i.Username">
              <Tag color="geekblue" :key="i.Username"> {{i.Username}}</Tag>
            </Checkbox>
          </CheckboxGroup>
        </FormItem>
        <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
        <br>
        <FormItem label="用户管理权限:">
          <p v-if="perList.user === '0'">否</p>
          <p v-else>是</p>
        </FormItem>
        <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
        <br>
        <FormItem label="数据库管理权限:">
          <p v-if="perList.base === '0'">否</p>
          <p v-else>是</p>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="editInfodModal=false">取消</Button>
        <Button type="error" @click="reject" v-if="orderStatus.s === 2">驳回</Button>
        <Button type="success" @click="savedata" v-if="orderStatus.s === 2">同意</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
    import axios from 'axios'

    export default {
        name: 'permissions',
        data() {
            return {
                permissondata: [],
                permissoncolums: [
                    {
                        title: '申请编号',
                        key: 'WorkId'
                    },
                    {
                        title: '申请人',
                        key: 'Username'
                    },
                    {
                        title: '申请时间',
                        key: 'Date'
                    },
                    {
                        title: '状态',
                        key: 'status',
                        width: 150,
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
                            }
                            return h('Tag', {
                                props: {
                                    type: 'dot',
                                    color: color
                                }
                            }, text)
                        },
                        sortable: true,
                        filters: [{
                            label: '已执行',
                            value: 1
                        },
                            {
                                label: '驳回',
                                value: 0
                            },
                            {
                                label: '待审核',
                                value: 2
                            }
                        ],
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 200,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        size: 'small',
                                        type: 'text'
                                    },
                                    on: {
                                        click: () => {
                                            this.modalinfo(params.row)
                                        }
                                    }
                                }, '查看')
                            ])
                        }
                    }
                ],
                per_pn: 1,
                editInfodModal: false,
                perList: {
                },
                connectionList: [],
                query_list: [],
                auditor: [],
                orderStatus: {
                    s: '',
                    work_id: ''
                }
            }
        },
        methods: {
            permisson_list(vl = 1) {
                axios.get(`${this.$config.url}/rules?page=${vl}`)
                    .then(res => {
                        this.permissondata = res.data.data;
                        this.per_pn = res.data.pg
                    })
                    .catch(error => {
                        this.$config.err_notice(this, error)
                    })
            },
            init() {
                axios.put(`${this.$config.url}/dash/userinfo`)
                    .then(res => {
                        this.connectionList = res.data.source;
                        this.query_list = res.data.query;
                        this.auditor = res.data.au;
                    })
            },
            modalinfo(vl) {
                this.editInfodModal = true;
                this.perList = vl.Permissions;
                this.orderStatus.s = vl.Status;
                this.orderStatus.work_id = vl.WorkId
            },
            savedata() {
                axios.put(`${this.$config.url}/rules/allow`,
                    {
                        'WorkId': this.orderStatus.work_id,
                        'Permission': this.perList
                    })
                    .then(res => {
                        this.$config.notice(res.data);
                        this.editInfodModal = false;
                        this.permisson_list()
                    })
                    .catch(error => {
                        this.$config.err_notice(this, error)
                    })
            },
            reject() {
                axios.put(`${this.$config.url}/rules/reject`,
                    {
                        'WorkId': this.orderStatus.work_id
                    })
                    .then(res => {
                        this.$config.notice(res.data);
                        this.editInfodModal = false;
                        this.permisson_list()
                    })
                    .catch(error => {
                        this.$config.err_notice(this, error)
                    })
            }
        },
        mounted() {
            this.permisson_list();
            this.init()
        }
    }
</script>

<style scoped>
</style>
