const DEMO_INSTANCE = 'c58596582'

Vue.use(VueRouter)

const sdk = new PrevioletSDK({
  instance: DEMO_INSTANCE,
  appVersion: '1.0.0',
  debug: true,
})

sdk.remoteConfig().defaultConfig({
  'welcome_message': 'Hello!',
})

var router = new VueRouter({
  mode: 'history',
  routes: [
    { 
      path: '/hot-desk',
      name: 'index',
      component: {
        data: function () {
          return {
            sdk,
            credentials: {
              email: 'john@obviouslydoe.com',
              password: '1234',
            },
            authenticated: false,
            currentUser: null,
            floors: null,
            selectedFloor: null,
            desks: [],
            selectedDesk: null,
            selectedNrOfDays: 1,
            selectedDate: null,
            dateMin: null,
            dateMax: null,
            reservations: null,
            screen: {
              active: null,
              list: [
                {
                  handle: 'floor-selection',
                  show: (vm) => {
                    if (null === vm.floors) {
                      sdk.db().select('floor').get().then(floors => {
                        vm.floors = floors
                      })
                    }

                    vm.selectedFloor = null
                    vm.selectedDesk = null
                  }
                },
                {
                  handle: 'desk-search',
                },
                {
                  handle: 'desk-view',
                },
                {
                  handle: 'reservations',
                  show: (vm) => {
                    if (null === vm.reservations) {
                      sdk.db().select('reservation').get({_limit: 10}).then(reservations => {
                        vm.reservations = reservations
                      })
                    }
                  }
                },
                {
                  handle: 'account',
                },
                {
                  handle: 'login',
                }
              ],
              set: screen => {
                const vm = this
                vm.screen.list.forEach(s => {
                  if (s.handle == screen) {
                    // run the screen "show" function if it exists
                    if (typeof s.show == 'function') {
                      s.show(vm)
                    }

                    vm.screen.active = s
                  }
                })
              },
              visible: (handle, returnValue) => {
                returnValue = returnValue || true
                return this.screen.active && this.screen.active.handle && this.screen.active.handle == handle ? returnValue : false
              }
            },
            footerMenu: [
              {
                icon: 'view_agenda',
                screen: 'reservations',
              },
              {
                icon: 'home',
                screen: 'floor-selection',
              },
              {
                icon: 'face',
                screen: 'account',
              },
            ]
          }
        },

        template: `
          <div class="container">
            <div v-if="screen.visible('login')">
              <h1 class="display-4 mb-5">Hot desk</h1>

              <div class="form-group">
                <label for="input-email">Email address</label>
                <input type="email" class="form-control" id="input-email" placeholder="name@example.com" v-model="credentials.email">
              </div>

              <div class="form-group">
                <label for="input-pass">Password</label>
                <input type="password" class="form-control" id="input-pass" v-model="credentials.password">
              </div>

              <button type="button" class="btn btn-primary btn-lg btn-block mt-5" @click="login">Login</button>
            </div>
            <div v-else>

              <div v-if="screen.visible('floor-selection')">
                <h1 class="display-4">Floors</h1>
                <p>Choose a building floor to search for an available desk:</p>

                <ul class="list-group mt-5" v-if="floors">
                  <a href="javascript:;" class="list-group-item" v-for="floor in floors" @click="selectedFloor = floor">
                    {{ floor.title }}
                    <p class="mb-0 text-muted">{{ floor.description }}</p>
                  </a>
                </ul>
              </div>

              <div v-if="screen.visible('desk-search')">
                <h1 class="display-4">{{ selectedFloor.title }}</h1>

                <p class="card-text">{{ selectedFloor.description }}</p>
                <a href="javascript:;" @click="selectedFloor = null" class="btn btn-secondary btn-sm btn-block">Select another floor</a>

                <div class="form-group mt-5">
                  <label>Reservation start date</label>
                  <input type="date" class="form-control" :min="dateMin" :max="dateMax" v-model="selectedDate">
                  <small class="form-text text-muted">Please select a reservation start date</small>
                </div>

                <label class="mt-2">How many days should we hold the desk for you?</label>
                <ul class="nav nav-pills nav-fill">
                  <li class="nav-item" v-for="day in [1, 2, 3, 4, 5]">
                    <a :class="'nav-link ' + (day == selectedNrOfDays ? 'active' : '')" href="javascript:;" @click="selectedNrOfDays = day">{{ day }}</a>
                  </li>
                </ul>

                <button type="button" class="btn btn-primary btn-lg btn-block mt-5" @click="findDesk" id="findButton">Find me a desk</button>

                <small class="form-text text-muted" v-if="selectedNrOfDays == 1">Search for an available desk for <strong>{{ moment(selectedDate).format('dddd, MMM Do') }}</strong></small>
                <small class="form-text text-muted" v-else>Search for an available desk from <strong>{{ moment(selectedDate).format('dddd, MMM Do') }}</strong> to <strong>{{ moment(selectedDate).add(selectedNrOfDays - 1, 'd').format('dddd, MMM Do') }}</strong></small>

                <div v-if="desks && desks.length" class="mt-5">
                  <img :src="selectedFloor.plan[0].url" width="100%" v-if="selectedFloor.plan && selectedFloor.plan[0]">
                  <p class="text-center">{{ selectedFloor.title }}</p>

                  <div class="card mb-3" v-for="desk in desks" @click="selectedDesk = desk">
                    <div class="row no-gutters">
                      <div class="col-6" :style="'background-image:url(' + getViewUrl(desk) + '); background-size: cover; background-position: center top;'">
                      </div>
                      <div class="col-6">
                        <div class="card-body" style="padding: 1rem;">
                          <h6 class="card-title mb-0">{{ desk.item }}</h6>
                          <p class="card-text mb-0" style="line-height:.9em;"><small class="text-muted">{{ desk.note }}</small></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="screen.visible('desk-view')">
                <img :src="selectedDesk.view[0].url" class="mb-3" width="100%" v-if="selectedDesk.view && selectedDesk.view[0]">

                <h5 class="card-title">{{ selectedDesk.item }}</h5>
                <p class="card-text" v-if="selectedDesk.note">{{ selectedDesk.note }}</p>

                <a href="javascript:;" @click="selectedDesk = null" class="btn btn-secondary btn-sm btn-block">Select another desk</a>

                <div class="alert alert-primary mt-5" role="alert">
                  Your reservation is for <strong>{{ selectedNrOfDays }} {{ selectedNrOfDays == 1 ? 'day' : 'days' }}</strong> starting {{ moment(selectedDate).format('dddd, MMM Do') }}.
                </div>

                <button type="button" class="btn btn-primary btn-lg btn-block mt-5" @click="confirmReservation">Confirm reservation</button>
              </div>

              <div v-if="screen.visible('reservations')">
                <h1 class="display-4">My desks</h1>

                <div v-if="reservations && reservations.length" class="mb-5">
                  <p>Below are your reserved desks, please make sure to use them:</p>
                </div>
                <div v-else class="mb-5">
                  <p>You don't have a desk reserved.</p>
                  <p>If you want to work from the office in the following week go ahead and reserve one:</p>
                  <button type="button" class="btn btn-primary btn-lg btn-block mt-5" @click="screen.set('floor-selection')">Reserve desk</button>
                </div>

                <div class="card mb-3" v-for="reservation in reservations">
                  <div class="row no-gutters">
                    <div class="col-5" :style="'background-image:url(' + getViewUrl(reservation.desk[0]) + '); background-size: cover; background-position: center center;'">
                    </div>
                    <div class="col-7">
                      <div class="card-body" style="padding: 1rem;">
                        <h6 class="card-title mb-0">{{ reservation.desk[0].item }}, {{ reservation.desk[0].floor[0].title }}</h6>

                        <p class="card-text" v-if="reservation.from == reservation.to"><small class="text-muted">{{ moment(reservation.from * 1000).format('dddd, MMM Do') }}</small></p>
                        <p class="card-text" v-else><small class="text-muted">{{ moment(reservation.from * 1000).format('dddd, MMM Do') }} - {{ moment(reservation.to * 1000).format('dddd, MMM Do') }}</small></p>

                        <button class="btn btn-sm btn-secondary" @click="cancelReservation(reservation)">Cancel reservation</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="screen.visible('account')">
                <h1 class="display-4">Account</h1>

                <div class="text-center">
                  <i class="material-icons" style="font-size: 6em;">face</i>
                  <p>
                    logged in as {{ currentUser.name }} <br/>
                    ({{ currentUser.email }})
                  </p>
                </div>

                <button class="btn btn-secondary btn-block mt-5" @click="logout">Logout</button>
              </div>

              <nav class="footer-menu fixed-bottom bg-dark">
                <div class="row justify-content-center">
                  <div class="col-4 text-center" v-for="menuItem in footerMenu">
                    <a href="javascript:;" :class="'menu-item ' + screen.visible(menuItem.screen, 'active')" @click="screen.set(menuItem.screen)">
                      <i class="material-icons md-48">{{ menuItem.icon }}</i>
                    </a>
                  </div>
                </div>
              </nav>

            </div>
          </div>
        `,

        methods: {
          login () {
            const vm = this

            sdk.auth().loginWithUsernameAndPassword(
              vm.credentials.email, 
              vm.credentials.password).catch(err => {
              alert(err)
            })
          },

          logout() {
            const vm = this
            sdk.auth().logout().then(ret => {
              // logout is complete
            })
          },

          findDesk() {
            const vm = this

            if (! moment(vm.selectedDate).isValid()) {
              alert('Please select a start date')
              return
            }

            vm.desks = []
            sdk.functions().run(130353631, {
              floor: vm.selectedFloor._id,
              from: moment(vm.selectedDate).format('YYYY-MM-DD'),
              days: vm.selectedNrOfDays,
            }).then(desks => {
              vm.desks = desks

              if (! desks.length) {
                alert('There are no available desks for the selected date and floor')
                return
              }

              vm.scrollTo($('#findButton'))
            })
          },

          scrollTo(element, delay) {
            delay = delay || 400
            $('html, body').stop().animate({
              'scrollTop': element.offset() && element.offset().top ? element.offset().top - 6 : 0
            }, delay, 'swing')
          },

          confirmReservation() {
            const vm = this

            sdk.functions().run('83841208', {
              desk: vm.selectedDesk._id,
              from: moment(vm.selectedDate).format('YYYY-MM-DD'),
              days: vm.selectedNrOfDays,
            }).then(ret => {
              if (ret.error) {
                alert(ret.error)
              }

              if (ret._id) {
                vm.reservations = null
                vm.screen.set('reservations')
              }
            })
          },

          cancelReservation(reservation) {
            const vm = this

            if (confirm('Are you sure you want to cancel this reservation?')) {
              sdk.db().select('reservation').delete(reservation._id).then(ret => {
                vm.reservations = null
                vm.screen.set('reservations')
              })
            }
          },

          getViewUrl(desk) {
            if (desk.view && desk.view[0] && desk.view[0].url) {
              return desk.view[0].url
            } else {
              return ''
            }
          }
        },

        created () {
          const vm = this

          sdk.auth().onAuthStateChanged((user) => {
            if (user) {
              vm.authenticated = true
              vm.currentUser = sdk.user().data
              vm.screen.set('reservations')
            } else {
              vm.authenticated = false
              vm.screen.set('login')
            }
          })

          var dow = parseInt(moment().format('d'))
          switch (dow) {
            // Friday, Saturday and Sunday let user select for next week
            case 5:
            case 6:
            case 0: {
              vm.dateMin = moment().format('YYYY-MM-DD')
              vm.dateMax = moment().day(1).add(11, 'd').format('YYYY-MM-DD')
              break;
            }

            // Any other day of the week select the current week up until Friday
            default: {
              vm.dateMin = moment().format('YYYY-MM-DD')
              vm.dateMax = moment().day(5).format('YYYY-MM-DD')
            }
          }

          // Default the current selected date to the beginning of the interval
          vm.selectedDate = vm.dateMin
        },

        watch: {
          'selectedFloor': function (newFloor) {
            const vm = this
            console.log('Selected floor', newFloor)

            vm.selectedDesk = null
            vm.desks = []

            if (null !== newFloor) {
              vm.screen.set('desk-search')
            }
          },

          'selectedDesk': function (newDesk) {
            const vm = this

            if (null === vm.selectedDesk) {
              setTimeout(() => {
                vm.scrollTo($('#findButton'), 1)
              }, 10)
            } else {
              vm.screen.set('desk-view')
            }
          },

          'selectedNrOfDays': function (nrDays) {
            const vm = this

            vm.selectedDesk = null
            vm.desks = []
          },
        }
      } 
    }
  ]
})

var app = new Vue({
  router: router
}).$mount('#app')
