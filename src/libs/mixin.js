import axios from 'axios'

export const opening = {
    data() {
        return {
            showing: false,
            disable: false,
            diffArgs: {
                title: '新建AutoTask',
                url: 'auto'
            }
        }
    },
    methods: {
        toggleShow() {
            this.showing = this.showing = true;
            this.disable = false;
            this.diffArgs = {
                title: '新建AutoTask',
                url: 'auto'
            }
        }
    }
};

export const fetchSth = {
    data() {
        return {
            fetchData: {
                idc: [],
                source: [],
                base: [],
                table: [],
                assigned: []
            }
        }
    },
    methods: {
        fetchSource(idc) {
            if (idc) {
                axios.get(`${this.$config.url}/fetch/source/${idc}/ddl`)
                    .then(res => {
                        if (res.data.x === 'ddl') {
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
        fetchIDC() {
            axios.get(`${this.$config.url}/fetch/idc`)
                .then(res => {
                    this.fetchData.idc = res.data;
                })
                .catch(error => {
                    this.$config.err_notice(this, error)
                })
        },
        fetchTable() {
            if (this.formItem.database) {
                axios.put(`${this.$config.url}/fetch/table`, {
                    'source': this.formItem.source,
                    'base': this.formItem.database
                })
                    .then(res => {
                        this.fetchData.table = res.data
                    }).catch(error => {
                    this.$config.err_notice(this, error)
                })
            }
        },
    }
};
export const order = {
    data () {
        return {
            testColumns: [
                {
                    title: '阶段',
                    key: 'Status',
                    width: '150'
                },
                {
                    title: '错误等级',
                    key: 'Level',
                    width: '100'
                },
                {
                    title: '错误信息',
                    key: 'Error',
                    tooltip: true,
                },
                {
                    title: '当前检查的sql',
                    key: 'SQL',
                    tooltip: true
                },
                {
                    title: '影响行数',
                    key: 'AffectRows',
                    width: '120'
                }
            ],
            ruleValidate: {
                idc: [
                    {
                        required: true,
                        message: '环境地址不得为空',
                        trigger: 'change'
                    }
                ],
                source: [
                    {
                        required: true,
                        message: '连接名不得为空',
                        trigger: 'change'
                    }
                ],
                database: [
                    {
                        required: true,
                        message: '数据库名不得为空',
                        trigger: 'change'
                    }
                ],
                table: [
                    {
                        required: true,
                        message: '数据表名不得为空',
                        trigger: 'change'
                    }
                ],
                tp: [
                    {
                        required: true,
                        message: '类型不得为空',
                        trigger: 'change'
                    }
                ],
                name: [
                    {
                        required: true,
                        message: '名称不得为空',
                        trigger: 'blur'
                    }
                ],
                text: [
                    {
                        required: true,
                        message: '提交说明不得为空',
                        trigger: 'blur'
                    }
                ],
                assigned: [
                    {
                        required: true,
                        message: '审核人不得为空',
                        trigger: 'change'
                    }
                ],
                backup: {required: true, type: 'number', message: '备份不得为空', trigger: 'change'}
            },
            invalidDate: {
                disabledDate(date) {
                    return date && date.valueOf() < Date.now() - 86400000
                }
            }
        }
    },
    methods: {
        clearForm() {
            this.formItem = this.$config.clearObj(this.formItem)
        },
        setCompletions(editor, session, pos, prefix, callback) {
            callback(null, this.wordList.map(function (word) {
                return {
                    caption: word.vl,
                    value: word.vl,
                    meta: word.meta
                }
            }))
        },
        editorInit: function () {
            require('brace/mode/mysql');
            require('brace/theme/xcode')
        }
    }
};
