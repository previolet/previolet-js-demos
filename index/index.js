Vue.use(VueRouter)

var router = new VueRouter({
  mode: 'history',
  routes: [
    { 
      path: '/',
      name: 'index',
      component: {
        data: function () {
          return {
            demos: [
              {
                name: 'Guest browsing',
                description: 'A simple app showing how to access resources as guest.',
                featuring: [
                  'Authentification',
                  'Data Views',
                ],
                url: '/authentication-1',
              },
              {
                name: 'Remote Configuration',
                description: 'A simple app showing how to use the remote configuration.',
                featuring: [
                  'Authentification',
                  'Remote Configuration',
                ],
                url: '/remote-config',
              },
              {
                name: 'Hot Desk',
                description: 'Reserve your office desk.',
                featuring: [
                  'Authentification',
                  'Storage',
                  'Cloud functions'
                ],
                url: '/hot-desk',
              },
            ],
          }
        },

        template: `
          <div class="container">
            <h1 class="display-4 mb-4">Previolet Demos</h1>

            <p class="mb-5">These are single page, self-contained web applications showcasing various Previolet SDK functionality.</p>

            <div class="card mb-3" v-for="demo in demos">
              <div class="row no-gutters">
                <div class="col-12">
                  <div class="card-body" style="padding: 1rem;">
                    <h4 class="card-title mb-0"><a :href="demo.url" target="_blank">{{ demo.name }}</a></h4>
                    <p class="card-text">{{ demo.description }}</p>

                    <div v-if="demo.featuring.length">
                      <small class="text-muted">The app is using the following SDK apis:</small>
                      <ul>
                        <li v-for="feature in demo.featuring"><small class="text-muted">{{ feature }}</small></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,

        methods: {
        },

        created () {
          const vm = this
        }
      } 
    }
  ]
})

var app = new Vue({
  router: router
}).$mount('#app')
