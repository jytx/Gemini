// import env from '../../config/env';
import Notice from 'iview/src/components/notice'
import {appRouter} from '../router'
import axios from 'axios'

let util = {};
util.title = function (title) {
    title = title || 'Yearning SQL审核平台';
    window.document.title = title
};

util.random = function random(lower, upper) {
    return Math.floor(Math.random() * (upper - lower)) + lower;
};

util.mode = function (obj) {
    let oc = {};
    Object.keys(obj).forEach(function (key) {
        if (typeof obj[key] === 'string') {
            if (obj[key] === '1') {
                oc[key] = '是'
            } else {
                oc[key] = '否'
            }
        } else if (typeof obj[key] === 'object') {
            oc[key] = obj[key]
        } else if (typeof obj[key] !== 'undefined') {
            oc[key] = obj[key].toString()
        } else {
            oc[key] = ''
        }
    });
    return oc
};

util.err_notice = function (vm, err) {
    let text = err;
    if (err.response !== undefined) {
        if (err.response.status === 401) {
            text = 'Token过期！请重新登录!';
            vm.$Message.warning(text);
            vm.$Modal.confirm({
                title: '重新登录',
                cancelText: '退出',
                okText: '登录',
                closable: true,
                render: (h) => {
                    return h('div', [
                        h('br'),
                        h('Input', {
                            props: {
                                value: vm.$store.state.password,
                                type: 'password',
                                autofocus: true,
                                placeholder: '请输入密码'
                            },
                            on: {
                                input: (val) => {
                                    vm.$store.state.password = val;
                                }
                            }
                        }),
                        h('br'),
                        h('br'),
                        h('Checkbox', {
                            props: {
                                value: vm.$store.state.openReLogin,
                            },
                            style: {
                                marginLeft: '40%'
                            },
                            on: {
                                checkbox: (val) => {
                                    vm.$store.state.openReLogin = val
                                }
                            }
                        }, 'ldap登录')
                    ])
                },
                onOk: () => {
                    let url = vm.$config.auth;
                    if (vm.$store.state.openReLogin) {
                        url = `${vm.$config.gen}/ldap`
                    }
                    axios.post(url, {
                        'username': sessionStorage.getItem('user'),
                        'password': vm.$store.state.password
                    })
                        .then(res => {
                            axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.token;
                            sessionStorage.setItem('jwt', `Bearer ${res.data.token}`);
                            vm.$Message.success("已重新登录!");
                            vm.$store.state.password = '';
                            vm.$store.state.openReLogin = false
                        })
                        .catch(err => {
                            vm.$config.auth_notice(err);
                            vm.$router.push({
                                name: 'login'
                            })
                        })
                },
                onCancel: () => {
                    vm.$router.push({
                        name: 'login'
                    })
                }
            })
        }
    } else {
        Notice.error({
            title: '错误',
            desc: text
        })
    }
};

util.auth_notice = function (err) {
    let text = err;
    if (err.response !== undefined) {
        if (err.response.status === 401) {
            text = '账号密码错误,请重新输入!'
        }
    }
    Notice.error({
        title: '错误',
        desc: text
    })
};

util.notice = function (vl) {
    Notice.info({
        title: '通知',
        desc: vl
    })
};

util.highlight = 'alter|and|as|asc|between|count|create|delete|desc|distinct|drop|from|having|in|insert|into|is|join|like|not|on|or|order|select|set|table|union|update|values|where|accessible|action|add|after|algorithm|all|analyze|asensitive|at|authors|auto_increment|autocommit|avg|avg_row_length|before|binary|binlog|both|btree|cache|call|cascade|cascaded|case|catalog_name|chain|change|changed|character|check|checkpoint|checksum|class_origin|client_statistics|close|coalesce|code|collate|collation|collations|column|columns|comment|commit|committed|completion|concurrent|condition|connection|consistent|constraint|contains|continue|contributors|convert|cross|current_date|current_time|current_timestamp|current_user|cursor|data|database|databases|day_hour|day_microsecond|day_minute|day_second|deallocate|dec|declare|default|delay_key_write|delayed|delimiter|des_key_file|describe|deterministic|dev_pop|dev_samp|deviance|directory|disable|discard|distinctrow|div|dual|dumpfile|each|elseif|enable|enclosed|end|ends|engine|engines|enum|errors|escape|escaped|even|event|events|every|execute|exists|exit|explain|extended|fast|fetch|field|fields|first|flush|for|force|foreign|found_rows|full|fulltext|function|general|global|grant|grants|group|groupby_concat|handler|hash|help|high_priority|hosts|hour_microsecond|hour_minute|hour_second|if|ignore|ignore_server_ids|import|index|index_statistics|infile|inner|innodb|inout|insensitive|insert_method|install|interval|invoker|isolation|iterate|key|keys|kill|language|last|leading|leave|left|level|limit|linear|lines|list|load|local|localtime|localtimestamp|lock|logs|low_priority|master|master_heartbeat_period|master_ssl_verify_server_cert|masters|match|max|max_rows|maxvalue|message_text|middleint|migrate|min|min_rows|minute_microsecond|minute_second|mod|mode|modifies|modify|mutex|mysql_errno|natural|next|no|no_write_to_binlog|offline|offset|one|online|open|optimize|option|optionally|out|outer|outfile|pack_keys|parser|partition|partitions|password|phase|plugin|plugins|prepare|preserve|prev|primary|privileges|procedure|processlist|profile|profiles|purge|query|quick|range|read|read_write|reads|real|rebuild|recover|references|regexp|relaylog|release|remove|rename|reorganize|repair|repeatable|replace|acequire|resignal|restrict|resume|return|returns|revoke|right|rlike|rollback|rollup|row|row_format|rtree|savepoint|schedule|schema|schema_name|schemas|second_microsecond|security|sensitive|separator|serializable|server|session|share|show|signal|slave|slow|smallint|snapshot|soname|spatial|specific|sql|sql_big_result|sql_buffer_result|sql_cache|sql_calc_found_rows|sql_no_cache|sql_small_result|sqlexception|sqlstate|sqlwarning|ssl|start|starting|starts|status|std|stddev|stddev_pop|stddev_samp|storage|straight_join|subclass_origin|sum|suspend|table_name|table_statistics|tables|tablespace|temporary|terminated|to|trailing|transaction|trigger|triggers|truncate|uncommitted|undo|uninstall|unique|unlock|upgrade|usage|use|use_frm|user|user_resources|user_statistics|using|utc_date|utc_time|utc_timestamp|value|variables|varying|view|views|warnings|when|while|with|work|write|xa|xor|year_month|zerofill|begin|do|then|else|loop|repeat|by|bool|boolean|bit|blob|decimal|double|enum|float|long|longblob|longtext|medium|mediumblob|mediumint|mediumtext|time|timestamp|tinyblob|tinyint|tinytext|text|bigint|int|int1|int2|int3|int4|int8|integer|float|float4|float8|double|char|varbinary|varchar|varcharacter|precision|date|datetime|year|unsigned|signed|numeric|ucase|lcase|mid|len|round|rank|now|format|coalesce|ifnull|isnull|nvl'

// util.url = location.protocol + '//' + document.domain + ':8000/api/v2';
// util.register = location.protocol + '//' + document.domain + ':8000/register';
// util.auth = location.protocol + '//' + document.domain + ':8000/login';
// util.gen = location.protocol + '//' + document.domain + ':8000';

util.url = '/api/v2';
util.register = '/register';
util.auth = '/login';
util.gen = '';

util.oneOf = function (ele, targetArr) {
    return targetArr.indexOf(ele) >= 0;
};

util.showThisRoute = function (itAccess, currentAccess) {
    if (typeof itAccess === 'object' && itAccess.isArray()) {
        return util.oneOf(currentAccess, itAccess)
    } else {
        return itAccess === currentAccess
    }
}

util.openPage = function (vm, name) {
    vm.$router.push({name: name});
    vm.$store.commit('Breadcrumbset', name);
    vm.$store.state.currentPageName = name;
    util.taglist(vm, name)
};

util.taglist = function (vm, name) {
    vm.$store.state.pageOpenedList.forEach((vl, index) => {
        if (vl.name === name && name !== 'home_index') {
            vm.$store.state.pageOpenedList.splice(index, 1)
        }
    });
    appRouter.forEach((val) => {
        for (let i of val.children) {
            if (i.name === name && name !== 'home_index') {
                vm.$store.state.pageOpenedList.push({'title': i.title, 'name': i.name})
            }
        }
    });
    localStorage.setItem('pageOpenedList', JSON.stringify(vm.$store.state.pageOpenedList))
};

util.clearObj = function (obj) {
    for (let i in obj) {
        if (typeof obj[i] === 'object') {
            obj[i] = []
        } else if (typeof obj[i] === 'string') {
            obj[i] = ''
        } else if (typeof obj[i] === 'number') {
            obj[i] = 0
        } else if (typeof obj[i] === 'boolean') {
            obj[i] = false
        } else {
            obj[i] = false
        }
    }
    return obj
};

util.clearOption = function (obj) {
    for (let i in obj) {
        if (typeof obj[i] === 'object') {
            obj[i] = ['']
        } else if (typeof obj[i] === 'string') {
            obj[i] = '0'
        } else if (typeof obj[i] === 'number') {
            obj[i] = 0
        } else {
            obj[i] = false
        }
    }
    return obj
};

util.clearPicker = function (obj) {
    for (let i in obj) {
        if (typeof obj[i] === 'object') {
            obj[i] = ['', '']
        } else if (typeof obj[i] === 'string') {
            obj[i] = ''
        } else {
            obj[i] = false
        }
    }
    return obj
};

util.sameMerge = function (obj, merge, el) {
    for (let i of Object.keys(el)) {
        obj[i] = merge[i]
    }
    return obj
};

util.concat = function (arr1, arr2) {
    let arr = arr1.concat();
    for (let i = 0; i < arr2.length; i++) {
        arr.indexOf(arr2[i]) === -1 ? arr.push(arr2[i]) : 0;
    }
    return arr;
};

export default util
