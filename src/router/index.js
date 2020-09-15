import Vue from 'vue'
import VueRouter from 'vue-router'

// views
import recommend from '@/views/recommend'
import singer from '@/views/singer'
import ranking from '@/views/ranking'
import search from '@/views/search'
import user from '@/views/user'

// children
import recommendDetail from '@/views/recommendDetail'
import singerDetail from '@/views/singerDetail'
import rankingDetail from '@/views/rankingDetail'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/recommend' /* 路由重定向 */
  },
  {
    name: 'recommend',
    path: '/recommend',
    component: recommend,
    children: [
      {
        path: ':id',
        component: recommendDetail
      }
    ]
  },
  {
    name: 'singer',
    path: '/singer',
    component: singer,
    children: [
      {
        path: ':id',
        component: singerDetail
      }
    ]
  },
  {
    name: 'ranking',
    path: '/ranking',
    component: ranking,
    children: [
      {
        path: ':id',
        component: rankingDetail
      }
    ]
  },
  {
    name: 'search',
    path: '/search',
    component: search,
    children: [
      {
        path: ':id',
        component: singerDetail
      }
    ]
  },
  {
    name: 'user',
    path: '/user',
    component: user
  }
]

const router = new VueRouter({
  routes
})

export default router
