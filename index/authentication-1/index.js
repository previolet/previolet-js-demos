Vue.use(VueRouter)

const previolet = new PrevioletSDK({
  instance: 'c16479059',
  appVersion: '1.0.1',
  debug: true,
})

previolet.remoteConfig().defaultConfig({
  'welcome_message': 'Hello!',
})

var router = new VueRouter({
  mode: 'history',
  routes: [
    { 
      path: '/authentication-1',
      name: 'index',
      component: {
        data: function () {
          return {
            authenticated: false,
            currentUser: {
              name: null
            },
            todos: null,
            credentials: {
              email: 'john@obviouslyjoe.com',
              password: 'pass1234',
            }
          }
        },

        template: `
          <div class="container">
            <div>
              <h1 class="display-4 mb-5">Guest Browsing</h1>

              <p v-if="currentUser.name == 'Guest'" class="alert alert-warning">Logged in as {{ currentUser.name }} (<a href="javascript:;" @click="login">login as John</a>)</p>
              <p v-else class="alert alert-success">Logged in as {{ currentUser.name }} (<a href="javascript:;" @click="logout">logout</a>)</p>

              <p>This demo features an application with guest browsing abilities.</p>
              <p>You are currently looking at a Todo database for which the app owner has forced a filter for Guest users. 
              The filter does not allow Guest users to access the resolution (<strong>done</strong>) parameter.</p>

              <p v-if="currentUser.name == 'Guest'">
                To check the experience as a logged in user and get the todo resolution as well click <a href="javascript:;" @click="login">here</a> to use predefined test credentials.
              </p>

              <ul v-if="todos">
                <li v-for="item in todos">
                  <span class="badge badge-warning" v-if="item.priority == 'low'">{{ item.priority }}</span> 
                  <span class="badge badge-danger" v-if="item.priority == 'high'">{{ item.priority }}</span> 
                  {{ item.item }}
                  (resolution: 
                    <span class="badge badge-dark" v-if="typeof item.done == 'undefined'">unknown</span>
                    <span class="badge badge-success" v-if="typeof item.done != 'undefined' && item.done">done</span>
                    <span class="badge badge-danger" v-if="typeof item.done != 'undefined' && ! item.done">todo</span>
                  )
                </li>
              </ul>
            </div>
          </div>
        `,

        methods: {
          login () {
            const vm = this

            previolet.auth().loginWithUsernameAndPassword(
              vm.credentials.email, 
              vm.credentials.password).catch(err => {
              alert(err.error)
            })
          },

          logout() {
            const vm = this
            previolet.auth().logout().then(() => {
              // after logging out login as guest
              previolet.auth().loginAsGuest()
            })
          },
        },

        created () {
          const vm = this

          previolet.auth().onAuthStateChanged((user) => {
            if (user) {
              vm.authenticated = true
              vm.currentUser = previolet.user().data

              previolet.db().select('Todo').get().then(records => {
                vm.todos = records
              })

            } else {
              vm.authenticated = false
              vm.currentUser = {
                name: null
              }
            }
          })

          if (! vm.authenticated) {
            // login as guest if we're not authenticated as a different user
            previolet.auth().loginAsGuest()
          }
        },

        watch: {
        }
      } 
    }
  ]
})

var app = new Vue({
  router: router
}).$mount('#app')
