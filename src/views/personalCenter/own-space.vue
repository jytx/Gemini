<style lang="less">
  @import '../../styles/own-space.less';
  @import '../../styles/common.less';
</style>

<template>
  <div>
    <div>
      <Form ref="userForm" label-position="right">
        <FormItem label="用户名：" prop="name">
          <div>
            <span>{{ userForm.Username }}</span>
          </div>
        </FormItem>
        <FormItem label="姓名：" prop="name">
          <div>
            <span>{{ userForm.RealName }}</span>
          </div>
        </FormItem>
        <FormItem label="部门：">
          <span>{{ userForm.Department }}</span>
        </FormItem>
        <FormItem label="角色：">
          <span>{{ userForm.Rule }}</span>
        </FormItem>
        <FormItem label="邮箱：">
          <span>{{ userForm.Email }}</span>
        </FormItem>
        <Button type="warning" size="small" @click="editPasswordModal=true">修改密码</Button>
        <Button type="primary" size="small" @click="openMailChange" class="margin-left-10">修改邮箱/真实姓名</Button>
        <Button type="success" size="small" @click="openPerChange" class="margin-left-10">查看权限</Button>
      </Form>
    </div>

    <Modal v-model="editPasswordModal" :closable='false' :mask-closable=false :width="500">
      <h3 slot="header" style="color:#2D8CF0">修改密码</h3>
      <Form ref="editPasswordForm" :model="editPasswordForm" :label-width="100" label-position="right"
            :rules="passwordValidate">
        <FormItem label="新密码" prop="newPass">
          <Input v-model="editPasswordForm.newPass" placeholder="请输入新密码，至少6位字符" type="password"></Input>
        </FormItem>
        <FormItem label="确认新密码" prop="rePass">
          <Input v-model="editPasswordForm.rePass" placeholder="请再次输入新密码" type="password"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="editPasswordModal=false">取消</Button>
        <Button type="primary" :loading="savePassLoading" @click="saveEditPass">保存</Button>
      </div>
    </Modal>

    <Modal v-model="editEmailModal" :closable='false' :mask-closable=false :width="500">
      <h3 slot="header" style="color:#2D8CF0">邮箱/真实姓名修改</h3>
      <Form :label-width="100" label-position="right">
        <FormItem label="邮箱地址">
          <Input v-model="editEmailForm.Email"></Input>
        </FormItem>
        <FormItem label="真实姓名">
          <Input v-model="editEmailForm.RealName"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="editEmailModal=false">取消</Button>
        <Button type="primary" :loading="savePassLoading" @click="saveEmail">保存</Button>
      </div>
    </Modal>

    <Modal v-model="editInfoModal" width="700">
      <h3 slot="header" style="color:#2D8CF0">用户权限信息</h3>
      <Form  label-position="top">
        <Divider orientation="left">DDL权限</Divider>
        <FormItem label="DDL及索引权限:">
          <RadioGroup v-model="permission.ddl">
            <Radio label="1">是</Radio>
            <Radio label="0">否</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="可访问的连接名:" v-if="permission.ddl === '1'">
          <CheckboxGroup v-model="permission.ddl_source">
            <Checkbox v-for="i in connectionList" :label="i.Source" :key="i.Source">
              <Tag color="purple" :key="i.Source"> {{i.Source}}</Tag>
            </Checkbox>
          </CheckboxGroup>
        </FormItem>
        <Divider orientation="left">DML权限</Divider>
        <FormItem label="DML是否可见:">
          <RadioGroup v-model="permission.dml">
            <Radio label="1">是</Radio>
            <Radio label="0">否</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="可访问的连接名:" v-if="permission.dml === '1'">
          <CheckboxGroup v-model="permission.dml_source">
            <Checkbox v-for="i in connectionList" :label="i.Source" :key="i.Source">
              <Tag color="geekblue" :key="i.Source"> {{i.Source}}</Tag>
            </Checkbox>
          </CheckboxGroup>
        </FormItem>
        <Divider orientation="left">查询权限</Divider>
        <FormItem label="查询是否可见:">
          <RadioGroup v-model="permission.query">
            <Radio label="1">是</Radio>
            <Radio label="0">否</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="可访问的连接名:" v-if="permission.query === '1'">
          <CheckboxGroup v-model="permission.query_source">
            <Checkbox v-for="i in query_list" :label="i.Source" :key="i.Source">
              <Tag color="geekblue" :key="i.Source"> {{i.Source}}</Tag>
            </Checkbox>
          </CheckboxGroup>
        </FormItem>
        <Divider orientation="left">上级审核人</Divider>
        <FormItem>
          <CheckboxGroup v-model="permission.auditor">
            <Checkbox v-for="i in auditor" :label="i.Username" :key="i.Username">
              <Tag color="geekblue" :key="i.Username"> {{i.Username}}</Tag>
            </Checkbox>
          </CheckboxGroup>
        </FormItem>
        <Divider orientation="left">管理权限</Divider>
        <FormItem label="用户管理权限:">
          <RadioGroup v-model="permission.user">
            <Radio label="1" disabled>是</Radio>
            <Radio label="0" disabled>否</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="数据库管理权限:">
          <RadioGroup v-model="permission.base">
            <Radio label="1" disabled>是</Radio>
            <Radio label="0" disabled>否</Radio>
          </RadioGroup>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="warning" @click="editInfoModal=false">取消</Button>
        <Button type="success" @click="referRuleOrder" class="margin-left-10">申请权限</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
    //

    import axios from 'axios'

    export default {
        name: 'own-space',
        data() {
            const valideRePassword = (rule, value, callback) => {
                if (value !== this.editPasswordForm.newPass) {
                    callback(new Error('两次输入密码不一致'))
                } else {
                    callback()
                }
            }
            return {
                query_list: [],
                editEmailModal: false,
                editEmailForm: {
                    mail: '',
                    real_name: ''
                },
                userForm: Object,
                formItem: {
                    ddl: '',
                    ddlcon: ''
                },
                uid: '', // 登录用户的userId
                save_loading: false,
                editPasswordModal: false, // 修改密码模态框显示
                savePassLoading: false,
                oldPassError: '',
                checkIdentifyCodeLoading: false,
                editPasswordForm: {
                    newPass: '',
                    rePass: ''
                },
                passwordValidate: {
                    oldPass: [
                        {
                            required: true,
                            message: '请输入原密码',
                            trigger: 'blur'
                        }
                    ],
                    newPass: [
                        {
                            required: true,
                            message: '请输入新密码',
                            trigger: 'blur'
                        },
                        {
                            min: 6,
                            message: '请至少输入6个字符',
                            trigger: 'blur'
                        },
                        {
                            max: 32,
                            message: '最多输入32个字符',
                            trigger: 'blur'
                        }
                    ],
                    rePass: [{
                        required: true,
                        message: '请再次输入新密码',
                        trigger: 'blur'
                    },
                        {
                            validator: valideRePassword,
                            trigger: 'blur'
                        }
                    ]
                },
                editInfoModal: false,
                permission: {
                    ddl: '0',
                    ddlcon: Array,
                    dml: '0',
                    dmlcon: Array,
                    query: '0',
                    querycon: Array,
                    index: '0',
                    indexcon: Array,
                    user: '0',
                    base: '0',
                    auditor: []
                },
                permission_list: Object,
                connectionList: {},
                auditor: []
            }
        },
        methods: {
            referRuleOrder() {
                axios.post(`${this.$config.url}/dash/refer`, {
                    'Permission': this.permission
                })
                    .then(res => {
                        this.$config.notice(res.data);
                        this.editInfoModal = false
                    })
                    .catch(err => this.$config.err_notice(this, err))
            },
            openMailChange() {
                this.editEmailModal = true
                this.editEmailForm = this.userForm
            },
            openPerChange() {
                this.editInfoModal = true
            },
            saveEditPass() {
                this.$refs['editPasswordForm'].validate((valid) => {
                    if (valid) {
                        this.savePassLoading = true
                        axios.post(`${this.$config.url}/user/password_reset`, {
                            'username': this.userForm.username,
                            'new': this.editPasswordForm.newPass
                        })
                            .then(res => {
                                this.$config.notice(res.data);
                                this.editPasswordModal = false
                            })
                            .catch(error => {
                                this.$config.err_notice(this, error)
                            })
                        this.savePassLoading = false
                    }
                })
                for (let i in this.editPasswordForm) {
                    this.editPasswordForm[i] = ''
                }
            },
            saveEmail() {
                this.savePassLoading = true;
                axios.post(`${this.$config.url}/user/mail_reset`, {
                    'mail': this.editEmailForm.Email,
                    'username': this.userForm.UserName,
                    'real': this.editEmailForm.RealName
                })
                    .then(res => {
                        this.$config.notice(res.data)
                        this.editEmailModal = false
                        sessionStorage.setItem('real_name', this.editEmailForm.real_name)
                    })
                    .catch(error => {
                        this.$config.err_notice(this, error)
                    });
                this.savePassLoading = false
            },
            init() {
                axios.put(`${this.$config.url}/dash/userinfo`)
                    .then(res => {
                        this.userForm = res.data.u;
                        this.permission = res.data.p;
                        this.permission.auditor = ['admin'];
                        this.connectionList = res.data.source;
                        this.query_list = res.data.query;
                        this.auditor = res.data.au;
                        if (res.data.s.Stmt === 0) {
                            this.$store.state.stmt = true
                        } else {
                            this.$store.state.stmt = false
                        }
                    })
            }
        },
        mounted() {
            this.init()
        }
    }
</script>
