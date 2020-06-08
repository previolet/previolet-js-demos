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
      path: '/remote-config',
      name: 'index',
      component: {
        data: function () {
          return {
            authenticated: false,
            welcome_message: null,
            currentUser: {
              name: null
            },
            credentials: {
              email: 'john@obviouslyjoe.com',
              password: 'pass1234',
            }
          }
        },

        template: `
          <div class="container">
            <div>
              <h1 class="display-4">Remote Config</h1>
              <h3 class="mb-5">{{ welcome_message }}</h3>

              <p v-if="currentUser.name == 'Guest'" class="alert alert-warning">Logged in as {{ currentUser.name }} (<a href="javascript:;" @click="login">login as John</a>)</p>
              <p v-else class="alert alert-success">Logged in as {{ currentUser.name }} (<a href="javascript:;" @click="logout">logout</a>)</p>

              <p>This demo features an application with remote configuration.</p>
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
            previolet.auth().logout()
          },
        },

        created () {
          const vm = this

          previolet.auth().onAuthStateChanged((user) => {
            if (user) {
              vm.authenticated = true
              vm.currentUser = previolet.user().data

              previolet.remoteConfig().get().then(config => {
                vm.welcome_message = config.welcome_message
              })
            } else {
              vm.authenticated = false
              vm.currentUser = {
                name: null
              }
            }
          })

          if (! vm.authenticated) {
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
