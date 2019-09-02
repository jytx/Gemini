<style lang="less">
  @import "../../styles/common.less";
  @import "../../styles/table.less";

  .tree {
    word-wrap: break-word;
    word-break: break-all;
    /*overflow-y: scroll;*/
    /*overflow-x: scroll;*/
    overflow: scroll;
    max-width: 600px;
    height: 600px;
  }
</style>

<template>
  <div>
    <Row>
      <Col :span="5" v-if="showTableinfo">
        <Card dis-hover>
          <p slot="title">
            <Icon type="ios-redo"></Icon>
            选择数据库
          </p>
          <div class="edittable-test-con">
            <div id="showImage" class="margin-bottom-10">
              <div>
                <Tree
                        :data="data1"
                        @on-toggle-expand="choseName"
                        @on-select-change="getTbale"
                        @empty-text="数据加载中"
                        class="tree"
                ></Tree>
                <Button type="info" icon="md-brush" @click="openDrawer" ghost>快速提交</Button>
                <Button type="error" icon="md-backspace" @click="deferReply" ghost class="margin-left-percent-5">结束会话
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col :span="slider2" class="padding-left-10">
        <Card dis-hover>
          <Button type="primary" icon="ios-skip-forward" @click="countAdd">隐藏数据列</Button>
          <br>
          <br>
          <Tabs type="card" :value="currentTab" @on-click="cur" name="base">
            <TabPane v-for="tab in tabs" :key="tab" :label="'查询' + tab" :name="'查询' + tab"
                     icon="logo-buffer" tab="base">
              <tabQuery :word-list="wordList" :export_data="export_data" :dataBase="put_info.base" :source="source"
                        :table="tableInfoName"></tabQuery>
            </TabPane>
            <Button @click="handleTabsAdd" size="small" slot="extra">增加窗口</Button>
            <Button @click="handleTabRemove" size="small" slot="extra" class="margin-left-10">减少窗口</Button>
          </Tabs>
        </Card>
      </Col>
    </Row>


    <Drawer title="DML语句快速提交" :closable="false" v-model="drawer.open" width="700" transfer>
      <Form :rules="ruleValidate" ref="referOrder" :model="referOrder">
        <FormItem label="环境:" prop="idc">
          <Select v-model="referOrder.idc" @on-change="fetchSource">
            <Option v-for="i in fetchData.idc" :key="i" :value="i">{{i}}</Option>
          </Select>
        </FormItem>

        <FormItem label="连接名:" prop="source">
          <Select v-model="referOrder.source" @on-change="fetchBase">
            <Option
                    v-for="i in fetchData.source"
                    :value="i"
                    :key="i"
            >{{ i }}
            </Option>
          </Select>
        </FormItem>

        <FormItem label="库名:" prop="database">
          <Select v-model="referOrder.database" placeholder="请选择">
            <Option v-for="item in fetchData.base" :value="item" :key="item">{{item}}</Option>
          </Select>
        </FormItem>

        <FormItem label="工单说明:" prop="text">
          <Input v-model="referOrder.text" placeholder="请输入" type="textarea" :rows=4></Input>
        </FormItem>

        <FormItem label="审核人:" prop="assigned">
          <Select v-model="referOrder.assigned" filterable>
            <Option v-for="i in fetchData.assigned" :value="i" :key="i">{{i}}</Option>
          </Select>
        </FormItem>

        <FormItem label="是否备份" required>
          <RadioGroup v-model="referOrder.backup">
            <Radio :label=1>是</Radio>
            <Radio :label=0>否</Radio>
          </RadioGroup>
        </FormItem>

        <FormItem label="定时执行">
          <DatePicker format="yyyy-MM-dd HH:mm" type="datetime" placeholder="选择时间点" :options="invalidDate"
                      v-model="referOrder.delay" @on-change="referOrder.delay=$event"
                      :editable="false"></DatePicker>
        </FormItem>
        <FormItem>
          <editor v-model="referOrder.textarea" @init="editorInit" @setCompletions="setCompletions"></editor>
        </FormItem>
      </Form>

      <Form :label-width="30">
        <FormItem>
          <Button
                  type="error"
                  icon="md-trash"
                  @click.native="clearForm()"
          >清除
          </Button>
          <Button type="primary" icon="md-search" @click.native="testSql()" :loading="loading"
                  class="margin-left-10">检测
          </Button>
          <Button type="warning" @click="beauty" :loading="loading" class="margin-left-10">美化</Button>
          <Button
                  type="success"
                  icon="ios-redo"
                  @click.native="commitOrder()"
                  :disabled="this.validate_gen"
                  class="margin-left-10"
          >提交
          </Button>
        </FormItem>

        <Table :columns="testColumns" :data="testRes" highlight-row></Table>
      </Form>

    </Drawer>

  </div>
</template>
<script>
    import axios from 'axios'
    import tabQuery from '../../components/tabQuery'
    import editor from '../../components/editor'

    const concat_ = function (arr1, arr2) {
        let arr = arr1.concat();
        for (let i = 0; i < arr2.length; i++) {
            arr.indexOf(arr2[i]) === -1 ? arr.push(arr2[i]) : 0;
        }
        return arr;
    }
    export default {
        components: {
            editor: editor,
            tabQuery
        },
        name: 'SearchSQL',
        props: {
          source: String
        },
        data() {
            return {
                slider2: 19,
                currentTab: '查询1',
                tableInfoName: '',
                testRes: [],
                loading: false,
                ruleValidate: {
                    idc: [{
                        required: true,
                        message: '环境地址不得为空',
                        trigger: 'change'
                    }],
                    source: [{
                        required: true,
                        message: '连接名不得为空',
                        trigger: 'change'
                    }],
                    database: [{
                        required: true,
                        message: '数据库名不得为空',
                        trigger: 'change'
                    }],
                    text: [{
                        required: true,
                        message: '说明不得为空',
                        trigger: 'blur'
                    }
                    ],
                    assigned: [{
                        required: true,
                        message: '审核人不得为空',
                        trigger: 'change'
                    }]
                },
                testColumns: [
                    {
                        title: '阶段',
                        key: 'Status'
                    },
                    {
                        title: '错误等级',
                        key: 'Level'
                    },
                    {
                        title: '错误信息',
                        key: 'Error',
                        tooltip: true
                    },
                    {
                        title: '当前检查的sql',
                        key: 'SQL',
                        tooltip: true
                    },
                    {
                        title: '影响行数',
                        key: 'AffectRows'
                    }
                ],
                fetchData: {
                    idc: [],
                    source: [],
                    base: []
                },
                invalidDate: {
                    disabledDate(date) {
                        return date && date.valueOf() < Date.now() - 86400000
                    }
                },
                drawer: {
                    open: false
                },
                referOrder: {
                    textarea: '',
                    backup: 0,
                    text: '',
                    idc: '',
                    source: ''
                },
                data1: [],
                validate_gen: true,
                put_info: {
                    base: '',
                    tablename: ''
                },
                export_data: false,
                wordList: [],
                tabs: 1,
                showTableinfo: true
            }
        },
        methods: {
            countAdd() {
                if (this.showTableinfo) {
                    this.showTableinfo = false;
                    this.slider2 = 24
                } else {
                    this.showTableinfo = true;
                    this.slider2 = 19
                }
            },
            beauty() {
                axios.put(`${this.$config.url}/query/beauty`, {
                    'sql': this.referOrder.textarea
                })
                    .then(res => {
                        this.referOrder.textarea = res.data
                    })
                    .catch(err => this.$config.err_notice(this, err))
            },
            cur(vl) {
                this.currentTab = vl
            },
            getTbale(vl) {
                if (vl[0].children) {
                    return
                }
                this.tableInfoName = vl[0].title
            },
            fetchIDC() {
                axios.get(`${this.$config.url}/fetch/idc`)
                    .then(res => {
                        this.fetchData.idc = res.data;
                    })
                    .catch(error => {
                        this.$config.err_notice(this, error)
                    })
            },
            fetchSource(idc) {
                if (idc) {
                    axios.get(`${this.$config.url}/fetch/source/${idc}/dml`)
                        .then(res => {
                            if (res.data.x === 'dml') {
                                this.fetchData.source = res.data.source;
                                this.fetchData.assigned = res.data.assigned
                            } else {
                                this.$config.notice('非法劫持参数！')
                            }
                        })
                        .catch(error => {
                            this.$config.err_notice(this, error)
                        })
                }
            },
            fetchBase(source) {
                if (source) {
                    axios.get(`${this.$config.url}/fetch/base/${source}`)
                        .then(res => {
                            this.fetchData.base = res.data;
                        })
                        .catch(error => {
                            this.$config.err_notice(this, error)
                        })
                }
            },
            handleTabRemove() {
                if (this.tabs === 1) {
                    this.$Message.error("窗口最少拥有一个！")
                } else {
                    if (this.currentTab === `查询${this.tabs}`) {
                        this.currentTab = `查询${this.tabs - 1}`
                    }
                    this.tabs--
                }
            },
            editorInit: function () {
                require('brace/mode/mysql')
                require('brace/theme/xcode')
            },
            handleTabsAdd() {
                this.tabs++
            },
            testSql() {
                this.$refs['referOrder'].validate((valid) => {
                    if (valid) {
                        this.loading = true;
                        axios.put(`${this.$config.url}/fetch/test`, {
                            'database': this.referOrder.database,
                            'sql': this.referOrder.textarea,
                            'isDMl': true,
                            'source': this.data1[0].title
                        })
                            .then(res => {
                                this.testRes = res.data;
                                let gen = 0;
                                this.testRes.forEach(vl => {
                                    if (vl.Level !== 0) {
                                        gen += 1
                                    }
                                });
                                if (gen === 0) {
                                    this.validate_gen = false
                                } else {
                                    this.validate_gen = true
                                }
                                this.loading = false
                            })
                            .catch(err => {
                                this.loading = false;
                                this.$config.err_notice(err)
                            })
                    } else {
                        this.$Message.error('请填写具体地址或sql语句后再测试!')
                    }
                })
            },
            commitOrder() {
                this.$refs['referOrder'].validate((valid) => {
                    if (valid) {
                        axios.post(`${this.$config.url}/sql/refer`, {
                            'ddl': this.referOrder,
                            'sql': this.referOrder.textarea,
                            'ty': 1
                        })
                            .then(res => {
                                this.validate_gen = true;
                                this.$Notice.success({
                                    title: '成功',
                                    desc: res.data
                                })
                            })
                            .catch(error => {
                                this.validate_gen = true;
                                this.$config.err_notice(this, error)
                            })
                    }
                })
            },
            clearForm() {
                this.formItem = this.$config.clearObj(this.formItem)
            },
            openDrawer() {
                this.fetchIDC();
                this.drawer.open = true
            },
            choseName(vl) {
                this.put_info.base = vl.title;
                if (vl.expand === true) {
                    this.$Spin.show({
                        render: (h) => {
                            return h('div', [
                                h('Icon', {
                                    'class': 'demo-spin-icon-load',
                                    props: {
                                        type: 'ios-loading',
                                        size: 18
                                    }
                                }),
                                h('div', 'Loading')
                            ])
                        }
                    });
                    axios.get(`${this.$config.url}/query/fetchtable/${vl.title}/${this.source}`)
                        .then(res => {
                            if (res.data === 0) {
                                this.$config.notice("已到查询时限上限,请重新申请查询！");
                                this.$router.push({
                                    name: 'query'
                                });
                                this.$Spin.hide();
                                return
                            }
                            this.wordList = concat_(this.wordList, res.data.highlight);
                            for (let i = 0; i < this.data1[0].children.length; i++) {
                                if (this.data1[0].children[i].title === vl.title) {
                                    this.data1[0].children[i].children = res.data.table
                                }
                            }
                            this.$Spin.hide()
                        })
                        .catch(() => this.$Spin.hide())
                }
            },
            deferReply() {
                axios.delete(`${this.$config.url}/query/undo`)
                    .then(res => this.$config.notice(res.data))
                    .catch(err => this.$config.err_notice(this, err));
                this.$router.push({
                    name: 'query'
                })
            },
            setCompletions(editor, session, pos, prefix, callback) {
                callback(null, this.wordList.map(function (word) {
                    return {
                        caption: word.vl,
                        value: word.vl,
                        meta: word.meta
                    }
                }))
            }
        },
        mounted() {
            axios.get(`${this.$config.url}/query/fetchbase?source=${this.source}`)
                .then(res => {
                    this.fetchData.assigned = res.data.sign;
                    this.data1 = res.data.info;
                    let tWord = this.$config.highlight.split('|');
                    for (let i of tWord) {
                        this.wordList.push({'vl': i, 'meta': '关键字'})
                    }
                    this.wordList = this.wordList.concat(res.data.highlight);
                    res.data['status'] === 1 ? this.export_data = true : this.export_data = false
                })
                .catch(err => this.$config.err_notice(this,err.response.data))
        }
    }
</script>
