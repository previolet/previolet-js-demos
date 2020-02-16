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
                name: 'Hot Desk',
                description: 'Reserve your office desk.',
                featuring: [
                  'Authentification',
                  'Storage',
                  'Cloud functions'
                ],
                url: '/hot-desk',
              }
            ],
          }
        },

        template: `
          <div class="container">
            <h1 class="display-4 mb-5">Previolet Demos</h1>

            <div class="card mb-3" v-for="demo in demos">
              <div class="row no-gutters">
                <div class="col-12">
                  <div class="card-body" style="padding: 1rem;">
                    <h4 class="card-title mb-0"><a :href="demo.url">{{ demo.name }}</a></h4>
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
