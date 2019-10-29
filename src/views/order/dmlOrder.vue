<style lang="less">
  @import "../../styles/common.less";
  @import "../../styles/table.less";
</style>

<template>
  <div>
    <Row>
      <Col span="6">
        <Card>
          <p slot="title">
            <Icon type="ios-redo"></Icon>
            选择数据库
          </p>
          <div class="edittable-test-con">
            <div id="showImage" class="margin-bottom-10">
              <Form ref="formItem" :model="formItem" :rules="ruleValidate" :label-width="80">
                <FormItem label="环境:" prop="idc">
                  <Select v-model="formItem.idc" @on-change="fetchSource">
                    <Option v-for="i in fetchData.idc" :key="i" :value="i">{{i}}</Option>
                  </Select>
                </FormItem>

                <FormItem label="连接名:" prop="source">
                  <Select v-model="formItem.source" @on-change="fetchBase">
                    <Option
                            v-for="i in fetchData.source"
                            :value="i"
                            :key="i"
                    >{{ i }}
                    </Option>
                  </Select>
                </FormItem>

                <FormItem label="库名:" prop="database">
                  <Select v-model="formItem.database" placeholder="请选择" @on-change="fetchTable">
                    <Option v-for="item in fetchData.base" :value="item" :key="item">{{item}}</Option>
                  </Select>
                </FormItem>

                <FormItem label="工单说明:" prop="text">
                  <Input v-model="formItem.text" placeholder="请输入" type="textarea" :rows=4></Input>
                </FormItem>

                <FormItem label="审核人:" prop="assigned">
                  <Select v-model="formItem.assigned" filterable>
                    <Option v-for="i in fetchData.assigned" :value="i" :key="i">{{i}}</Option>
                  </Select>
                </FormItem>

                <FormItem label="是否备份" prop="backup">
                  <RadioGroup v-model="formItem.backup">
                    <Radio :label=1>是</Radio>
                    <Radio :label=0>否</Radio>
                  </RadioGroup>
                </FormItem>

                <FormItem label="定时执行">
                  <DatePicker format="yyyy-MM-dd HH:mm" type="datetime" placeholder="选择时间点" :options="invalidDate"
                              v-model="formItem.delay" @on-change="formItem.delay=$event"
                              :editable="false"></DatePicker>
                </FormItem>
              </Form>
              <Form>
                <FormItem>
                  <Col span="5" class="margin-left-10">
                    <Button
                            type="error"
                            icon="md-trash"
                            @click.native="clearForm()"
                    >重置
                    </Button>
                  </Col>
                  <Col span="5" class="margin-left-10">
                    <Button type="primary" icon="md-search" @click.native="testSql()" :loading="loading">检测
                    </Button>
                  </Col>
                  <Col span="5" class="margin-left-10">
                    <Button type="warning" icon="ios-brush" @click.native="beauty()" :loading="loading">美化
                    </Button>
                  </Col>
                  <Col span="5" class="margin-left-10">
                    <Button
                            type="success"
                            icon="ios-redo"
                            @click.native="commitOrder()"
                            :disabled="this.validate_gen"
                    >提交
                    </Button>
                  </Col>

                </FormItem>
              </Form>

              <Alert>检测表字段提示信息
                <template slot="desc">
                  <p>1.错误等级 0正常,其他均为有问题。</p>
                  <p>2.阶段状态 审核成功</p>
                  <p>3.错误信息 用来表示错误信息</p>
                  <p>4.当前检查的sql</p>
                  <p>注:只有错误等级等于0时提交按钮才会激活</p>
                </template>
              </Alert>
            </div>
          </div>
        </Card>
      </Col>
      <Col span="18" class="padding-left-10">
        <Card>
          <p slot="title">
            <Icon type="ios-crop"></Icon>
            填写sql语句
          </p>
          <editor v-model="formItem.textarea" @init="editorInit" @setCompletions="setCompletions"></editor>
          <br>
          <br>
          <Table :columns="testColumns" :data="Testresults" highlight-row></Table>
        </Card>
      </Col>
    </Row>
  </div>
</template>
<script>
    import axios from 'axios'
    import editor from '../../components/editor'
    import {fetchSth, order} from "../../libs/mixin";

    export default {
        components: {
            editor: editor
        },
        mixins: [fetchSth, order],
        name: 'SQLsyntax',
        data() {
            return {
                validate_gen: true,
                formItem: {
                    text: '',
                    idc: '',
                    source: '',
                    database: '',
                    table: '',
                    backup: 1,
                    assigned: '',
                    delay: null,
                    textarea: ''
                },
                Testresults: [],
                item: {},
                id: null,
                assigned: [],
                wordList: [],
                loading: false
            }
        },
        methods: {
            beauty() {
                axios.put(`${this.$config.url}/query/beauty`, {
                    'sql': this.formItem.textarea
                })
                    .then(res => {
                        this.formItem.textarea = res.data
                    })
                    .catch(err => this.$config.err_notice(this, err))
            },
            testSql() {
                this.$refs['formItem'].validate((valid) => {
                    if (valid) {
                        this.loading = true;
                        axios.put(`${this.$config.url}/fetch/test`, {
                            'source': this.formItem.source,
                            'database': this.formItem.database,
                            'sql': this.formItem.textarea,
                            'isDMl': true
                        })
                            .then(res => {
                                this.Testresults = res.data;
                                let gen = 0;
                                this.Testresults.forEach(vl => {
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
                                this.$config.err_notice(this, err)
                            })
                    } else {
                        this.$Message.error('请填写具体地址或sql语句后再测试!')
                    }
                })
            },
            commitOrder() {
                this.$refs['formItem'].validate((valid) => {
                    if (valid) {
                        axios.post(`${this.$config.url}/sql/refer`, {
                            'ddl': this.formItem,
                            'sql': this.formItem.textarea,
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
            }
        },
        mounted() {
            this.fetchIDC();
            for (let i of this.$config.highlight.split('|')) {
                this.wordList.push({'vl': i, 'meta': '关键字'})
            }
        }
    }
</script>
