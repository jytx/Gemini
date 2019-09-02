import Vue from 'vue'
import Vuex from 'vuex'
import {
    appRouter
} from './router'
import util from './libs/util'

Vue.use(Vuex);
const store = new Vuex.Store({
    state: {
        stmt: false,
        password: '',
        openReLogin: false,
        // 新的属性
        menuList: [],
        currentPageName: 'home_index',
        currentPath: [{
            title: '首页',
            path: '/',
            name: 'home_index'
        }],
        pageOpenedList: [{
            title: '首页',
            path: '',
            name: 'home_index'
        }],
        snippet: []
    },
    mutations: {
        snippetTag(state, vm) {
            state.snippet.push({'title': vm.title, 'text': vm.text})
        },
       snippetTagToJson(state) {
            localStorage.setItem('snippet', JSON.stringify(state.snippet))
        },
        snippetTagFromJson(state) {
            state.snippet = JSON.parse(localStorage.getItem('snippet'))
        },
        snippetRemoveTag(state, vm) {
            const index = state.snippet.indexOf(vm);
            state.snippet.splice(index, 1)
        },
        Menulist(state) {
            let accessCode = parseInt(sessionStorage.getItem('access')) // 0
            let menuList = []
            appRouter.forEach((item) => {
                if (item.access !== undefined) { // item.access=0
                    if (util.showThisRoute(item.access, accessCode)) {
                        if (item.children.length <= 1) {
                            menuList.push(item)
                        } else {
                            let i = menuList.push(item)
                            let childrenArr = []
                            childrenArr = item.children.filter(child => {
                                if (child.access !== undefined) {
                                    if (child.access === accessCode) {
                                        return child
                                    }
                                } else {
                                    return child
                                }
                            })
                            menuList[i - 1].children = childrenArr
                        }
                    }
                } else {
                    if (item.children.length <= 1) {
                        menuList.push(item)
                    } else {
                        let i = menuList.push(item)
                        let childrenArr = []
                        childrenArr = item.children.filter(child => {
                            if (child.access !== undefined) {
                                if (util.showThisRoute(child.access, accessCode)) {
                                    return child
                                }
                            } else {
                                return child
                            }
                        })
                        menuList[i - 1].children = childrenArr
                    }
                }
            })
            state.menuList = menuList
        },
        lock() {
            sessionStorage.setItem('locking', '1')
        },
        unlock() {
            sessionStorage.setItem('locking', '0')
        },
        Breadcrumbset(state, name) {
            if (name === 'ownspace_index') {
                state.currentPath.splice(1, state.currentPath.length - 1)
                state.currentPath.push({
                    'title': '个人中心',
                    'path': 'ownspace',
                    'name': name
                })
            } else if (name === 'home_index') {
                state.currentPath.splice(1, state.currentPath.length - 1)
            } else if (name === 'myorder') {
                state.currentPath.splice(1, state.currentPath.length - 1)
                state.currentPath.push({
                    'title': '我的工单',
                    'path': 'message',
                    'name': name
                })
            } else {
                state.currentPath.splice(1, state.currentPath.length - 1)
                appRouter.forEach((val) => {
                    for (let i of val.children) {
                        if (i.name === name) {
                            state.currentPath.push({
                                'title': val.title,
                                'path': val.path,
                                'name': val.name
                            }, {
                                'title': i.title,
                                'path': `${val.path}/${i.path}`,
                                'name': i.name
                            })
                        }
                    }
                })
            }
        }
    }
})

export default store
