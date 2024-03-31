import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from "../stores/user.js"


import Dashboard from "../components/Dashboard.vue"
import Login from "../components/auth/Login.vue"
import ChangePassword from "../components/auth/ChangePassword.vue"
import Users from "../components/users/Users.vue"
import User from "../components/users/User.vue"
import { customRef } from 'vue'
import Menu from "../components/menu/Menu.vue"
import Menus from "../components/menu/Menus.vue"
import MenuDetails from "../components/menu/MenuDetails.vue"
import Orders from "../components/orders/Orders.vue"
import OrderTable from "../components/order/OrderTable.vue"
import OrdersTable from "../components/orders/OrdersTable.vue"
import EmployeeOrders from "../components/employeePage/EmployeeOrders.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Dashboard
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/password',
      name: 'ChangePassword',
      component: ChangePassword
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard
    },

    {
      path: '/users',
      name: 'Users',
      component: Users,
    },
    {
      path: '/users/:id',
      name: 'User',
      component: User,
      //props: true
      // Replaced with the following line to ensure that id is a number
      props: route => ({ id: parseInt(route.params.id) })
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/register/:id',
      name: 'Register',
      component: User,
      props: route => ({ id: parseInt(route.params.id) })
    },
    {
      path: '/menu',
      name: 'menu',
      component: Menus,
    },
    {
      path: '/menu/:id',
      name: 'MenuId',
      component: Menu,
      props: route => ({ id: parseInt(route.params.id) })
    },
    {
      path: '/menu/:id',
      name: 'create',
      component: Menu,
      props: route => ({ id: parseInt(route.params.id) })
    },
    {
      path: '/menu/:id',
      name: 'MenuDetails',
      component: MenuDetails,
    },
    {
      path: '/orders',
      name: 'orders',
      component: Orders,
    },
    {
      path: '/employeeOrders',
      name: 'employeeOrders',
      component: EmployeeOrders,
      beforeEnter: (to, from, next) => {
        if (useUserStore().user.type != "ED") {
          next(false);
        } else {
          next();
          return
        }
      }
    },
    {
      path: '/order',
      name: 'Order',
      component: OrderTable,
    },
    {
      path: '/ManageOrders',
      name: 'ordersManager',
      component: OrdersTable,
    }
  ]
})

let handlingFirstRoute = true

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  if (handlingFirstRoute) {
    handlingFirstRoute = false
    await userStore.restoreToken()
  }
  if ((to.name == 'Login') || (to.name == 'home')) {
    next()
    return
  }

  if ((to.name == 'orders')) {
    if (userStore.user.type != 'C') {
      next()
      return
    }
    next({ name: 'home' })
  }

  if ((to.name == 'Register')) {
    if (!userStore.user) {
      next()
      return
    }
    next({ name: 'home' })
  }

  if ((to.name == 'menu')) {
    next()
    return
  }

  if ((to.name == 'Dashboard')) {
    next()
    return
  }

  if ((to.name == 'Order')) {
    next()
    return
  }

  if (!userStore.user) {
    next({ name: 'Login' })
    return
  }

  if (to.name == 'User') {
    if ((userStore.userId == to.params.id) || (userStore.user.type == 'EM')) {
      next()
      return
    }
    next({ name: 'home' })
    return
  }
  if (to.name == 'MenuId') {
    if (userStore.user.type == 'EM') {
      next()
      return
    }
    next({ name: 'home' })
    return
  }
  if (to.name == 'create') {
    if (userStore.user.type == 'EM') {
      next()
      return
    }
    next({ name: 'home' })
    return
  }
  if (to.name == 'Users') {
    if (userStore.user.type == 'EM') {
      next()
      return
    }
    next({ name: 'home' })
  }

  if (to.name == 'ordersManager') {
    if (userStore.user.type == 'EM') {
      next()
      return
    }
    next({ name: 'home' })
  }
  next()
})

export default router
