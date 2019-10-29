<style>
  @import "../../styles/common.less";
</style>
<template>
  <div>
    <Row>
      <Card>
        <p slot="title">
          <Icon type="md-sync"></Icon>
          autoTask
        </p>
        <Form inline>
          <FormItem>
          </FormItem>
          <FormItem>
            <Button type="warning" @click="toggleShow">新建Task</Button>
          </FormItem>
          <FormItem>
            <Input placeholder="AutoTask名称" v-model="find.text"></Input>
          </FormItem>
          <FormItem>
            <Button type="success" @click="queryData">查询</Button>
            <Button type="primary" @click="queryCancel" class="margin-left-10">重置</Button>
          </FormItem>
        </Form>
        <Table :columns="task_columns" :data="task_data">
          <template slot-scope="{ row }" slot="tp">
            <Tag checkable color="primary" v-if="row.Tp === 0">Insert</Tag>
            <Tag checkable color="warning" v-if="row.Tp === 1">Update</Tag>
            <Tag checkable color="error" v-if="row.Tp === 2">Delete</Tag>
          </Template>
          <template slot-scope="{ row }" slot="status">
            <i-switch v-model="row.Status" @on-change="activityStatus(row)">
              <span slot="open">开</span>
              <span slot="close">关</span>
            </i-switch>
          </template>
          <template slot-scope="{ row }" slot="action">
            <Button type="primary" @click="openEditModal(row)">编辑</Button>
            <Poptip
                    confirm
                    title="确定要删除吗？"
                    @on-ok="delAutoTask(row)"
                    transfer
            >
              <Button type="error" class="margin-left-10">删除</Button>
            </Poptip>
          </template>
        </Table>
        <br>
        <Page :total="pg" show-elevator @on-change="fetchAutoTaskList" :page-size="15" ref="page"></Page>
      </Card>
    </Row>

    <Modal v-model="showing" :title="diffArgs.title" @on-ok="referAutoTask">
      <Form :model="formItem" ref="formItem" :rules="ruleValidate">
        <FormItem label="Task名称" prop="name">
          <Input v-model="formItem.name" :disabled="disable"></Input>
        </FormItem>
        <FormItem label="类型" required>
          <Select v-model="formItem.tp">
            <Option v-for="i in fetchList.tp" :key="i.v" :value="i.v">{{i.title}}</Option>
          </Select>
        </FormItem>
        <FormItem label="数据源" prop="source">
          <Select v-model="formItem.source" @on-change="fetchBase">
            <Option v-for="i in fetchData.source" :key="i.Source" :value="i.Source">{{i.Source}}</Option>
          </Select>
        </FormItem>
        <FormItem label="库" prop="database">
          <Select v-model="formItem.database" @on-change="fetchTable">
            <Option v-for="i in fetchData.base" :key="i" :value="i">{{i}}</Option>
          </Select>
        </FormItem>
        <FormItem label="表" prop="table">
          <Select v-model="formItem.table">
            <Option v-for="i in fetchData.table" :key="i" :value="i">{{i}}</Option>
          </Select>
        </FormItem>
        <FormItem label="最大影响行数" prop="row">
          <InputNumber :min="1" v-model="formItem.row"></InputNumber>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
    import {opening, fetchSth, order} from '../../libs/mixin'
    import axios from 'axios'

    export default {
        name: "autoTask",
        mixins: [opening, fetchSth, order],
        data() {
            return {
                openTask: false,
                fetchList: {
                    source: [],
                    tp: [
                        {
                            'title': 'Insert',
                            'v': 0
                        },
                        {
                            'title': 'Update',
                            'v': 1
                        },
                        {
                            'title': 'Delete',
                            'v': 2
                        }
                    ]
                },
                task_columns: [
                    {
                        title: '名称',
                        key: 'Name',
                    },
                    {
                        title: '类型',
                        key: 'Tp',
                        slot: 'tp'
                    },
                    {
                        title: '数据源',
                        key: 'Source',
                    },
                    {
                        title: '数据库',
                        key: 'Base',
                    },
                    {
                        title: '数据表',
                        key: 'Table',
                    },
                    {
                        title: '最大影响行数',
                        key: 'Affectrow',
                    },
                    {
                        title: '状态',
                        key: 'status',
                        slot: 'status'
                    },
                    {
                        title: '操作',
                        key: 'action',
                        slot: 'action'
                    },
                ],
                task_data: [],
                pg: 1,
                wordList: [],
                formItem: {
                    name: '',
                    source: '',
                    database: '',
                    table: '',
                    tp: 0,
                    row: 1
                },
                find: {}
            }
        },
        methods: {
            referAutoTask() {
                this.$refs['formItem'].validate((valid) => {
                    if (valid) {
                        axios.post(`${this.$config.url}/${this.diffArgs.url}`, {
                            'Tp': this.formItem
                        })
                            .then(res => {
                                this.$config.notice(res.data);
                                this.fetchAutoTaskList();
                            })
                            .catch(err => this.$config.err_notice(this, err))
                    } else {
                        this.$Message.error("请填写相关性信息！")
                    }
                })
            },
            fetchAutoTaskList(vl = 1) {
                axios.put(`${this.$config.url}/auto/fetch`, {
                    page: vl,
                    find: this.find
                })
                    .then(res => {
                        this.task_data = res.data.data;
                        this.task_data.forEach((item) => {
                            (item.Status === 1) ? item.Status = true : item.Status = false
                        });
                        this.pg = res.data.pg
                    })
            },
            openEditModal(vl) {
                this.showing = true;
                this.formItem = {
                    id: vl.ID,
                    row: vl.Affectrow,
                    name: vl.Name,
                    table: '',
                    database: '',
                    tp: vl.Tp
                };
                this.disable = true;
                this.diffArgs = {
                    title: '编辑AutoTask',
                    url: 'auto/edit'
                }
            },
            delAutoTask(vl) {
                axios.delete(`${this.$config.url}/auto/${vl.ID}`)
                    .then(res => {
                        this.$config.notice(res.data);
                        this.fetchAutoTaskList()
                    })
                    .catch(err => this.$config.err_notice(this, err))
            },
            queryData() {
                this.find.valve = true;
                this.fetchAutoTaskList();
            },
            queryCancel() {
                this.find = this.$config.clearPicker(this.find);
                this.fetchAutoTaskList();
            },
            activityStatus(vl) {
                let s = 0;
                if (vl.Status) {
                    s = 1
                }

                axios.post(`${this.$config.url}/auto/active`, {
                    'Tp': {'id': vl.ID, 'status': s}
                })
                    .then(res => this.$config.notice(res.data))
                    .catch(err => this.$config.err_notice(this, err))
            }
        },
        mounted() {
            this.fetchAutoTaskList();
            axios.get(`${this.$config.url}/auto`)
                .then(res => {
                    this.fetchData.source = res.data
                })
                .catch(err => this.$config.err_notice(this, err))
        }
    }
</script>

<style scoped>

</style>
