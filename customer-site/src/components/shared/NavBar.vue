<template>
  <nav :class="`nav ${scrollPosition > 0 ? 'nav-sticky' : ''}`">
    <div class="site-title-container">
      <a class="site-header" @click="(event) => { handleNavClick('/#home', event) }">Easy Booking</a>
    </div>
    <ul class="nav-links">
      <li @click="(event) => { handleNavClick(menuItem, event) }" v-for="menuItem in menuList" :key="menuItem.name">
        <a :class="`nav-item ${currentLink === menuItem?.name?.toLowerCase?.() && 'active'}`" :href="menuItem.link">{{
          menuItem.name }}</a>
      </li>
      <li v-if="currentUser || IsGuest" class="logout-item" @click="logout">
        <span class="material-symbols-outlined">logout</span>
        <span class="logout-text">Logout</span>
      </li>

    </ul>
    <button v-if="menuList?.length || currentUser" :class="`burger ${activeMobileMenu ? 'play' : ''}`"
      @click="() => { activeMobileMenu = !activeMobileMenu }">
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    </button>
  </nav>
  <div v-if="menuList?.length || currentUser"
    :class="`${activeMobileMenu ? 'mobile-menu-visible' : 'mobile-menu-hidden'}`">
    <ul class="mobile-menu-links">
      <li @click="(event) => { handleNavClick(menuItem, event) }" v-for="menuItem in menuList" :key="menuItem.name">
        <a :class="`nav-item ${currentLink === menuItem?.name?.toLowerCase?.() && 'active'}`" :href="menuItem.link">{{
          menuItem.name }}</a>
      </li>
      <li v-if="currentUser" class="logout-item logout-item-mobile" @click="logout">
        <span class="material-symbols-outlined">logout</span>
        <span class="logout-text">Logout</span>
      </li>
    </ul>
  </div>
  <button v-if="scrollPosition > 300" @click="scrollToTop" class="scroll-to-top">
    <span class="material-symbols-outlined">keyboard_arrow_up</span>
  </button>
</template>

<script setup>
import { getAuth, signOut } from "firebase/auth";
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
const activeMobileMenu = ref(false);
const scrollPosition = ref(0);
const store = useStore();
const router = useRouter();
const currentUser = ref(null);
let route = useRoute();

const IsGuest = computed(() => {
  return store.state.IsGuest;
})


const handleNavClick = async (menuItem, event) => {
  event.preventDefault();

  if (typeof menuItem === "string" && route.path !== '/') {
    store.commit("updateView", "landing")
    props.navFunctions.setCurrentLink("home");
    router.push(menuItem)
    return;
  }

  const element = document.getElementById(menuItem?.name?.toLowerCase() || 'home');
  if (element) {
    const offsetTop = element.offsetTop - 100
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }

  activeMobileMenu.value = false;
}

const handleScroll = () => {
  scrollPosition.value = window.scrollY || window.pageYOffset;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const logout = (event) => {
  activeMobileMenu.value = false;
  let auth = getAuth();

  store.commit("setIsGuest", false);

  signOut(auth).then(() => {
    handleNavClick('/', event)
  }).catch((err) => { console.log(err) })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);

  getAuth()
    .onAuthStateChanged((auth) => {
      currentUser.value = auth;
    })


});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});


const props = defineProps({
  menuList: {
    type: Array,
    default: () => [
      { name: 'Home', link: '#home' },
      { name: 'About', link: '#about' },
      // { name: 'Contact', link: '#contact' }
    ]
  },
  scrollPosition: {
    type: Number,
    default: 0
  },
  currentLink: {
    type: String,
    default: 'home'
  },
  navFunctions: {
    type: Object
  }

})

</script>

<style scoped>
.site-header {
  color: #ffffff;
  font-family: 'Rubik', sans-serif;
  cursor: pointer;
}

.site-title-container {
  font-weight: 700;
}

a {
  text-decoration: none;
  outline: none;
  -webkit-transition: 0.4s;
  transition: 0.4s;
  color: #ffffff;
  font-size: 20px;
  font-family: 'Rubik', sans-serif;
}

.nav {
  position: fixed;
  top: 0;
  width: 100%;
  max-width: 1920px;
  height: 80px;
  z-index: 1000;
  font-size: 18px;
  display: flex;
  justify-content: space-between;
  justify-self: center;
  align-items: center;
  margin: 0 auto;
  padding: 0 20px;
  flex-wrap: wrap;
  transition: all 0.3s ease-in-out;
  transform: translateY(0);
}

.nav-sticky {
  background-color: #7d37e1;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.3s ease-in-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.nav-links {
  display: flex;
  gap: 2px;
  list-style: none;
  margin-bottom: 5px;

  .opacity-zero {
    opacity: 0;
  }


  .nav-item {
    padding: 15px;
    display: block;
    font-family: 'Josefin Sans', sans-serif;
    position: relative;
    font-size: 18px;
    font-weight: 400;

  }

  .nav-item:after {
    content: "";
    position: absolute;
    height: 2px;
    bottom: 0;
    left: 0;
    transition: 0.3s;
    width: 0;
    background-color: white;
  }

  .nav-item:hover:after {
    width: 100%;
  }

  .active::after {
    width: 100%;
  }
}

.logout-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 15px;
  cursor: pointer;
  color: #ffffff;
  font-family: 'Josefin Sans', sans-serif;
  font-size: 19px;
  transition: 0.4s;
}

.logout-item-mobile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 15px;
  cursor: pointer;
  color: black;
  font-family: 'Josefin Sans', sans-serif;
  font-size: 19px;
  transition: 0.4s;
}

.logout-item:hover {
  opacity: 0.5;
}

.logout-item .material-symbols-outlined {
  font-size: 20px;
}


.burger {
  display: none;
  border: none;
  margin: 0;
  padding: 0;
  background: none;
  width: 30px;
  right: 30px;
  top: 30px;
  z-index: 1000;
  display: none;
  cursor: pointer;

  .bar {
    background-color: #ffffff;
    width: 30px;
    height: 3px;
    display: block;
    margin-bottom: 6px;
    border-radius: 10px;
    position: relative;
    right: 0;
    top: 0;
    opacity: 1;
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
    -webkit-transition: 0.3s;
    transition: 0.3s;
    -webkit-box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.5);
    box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.5);
  }

  &.play {
    .bar:nth-child(1) {
      top: 9px;
      -webkit-transform: rotate(45deg);
      transform: rotate(45deg);
    }

    .bar:nth-child(2) {
      right: 20px;
      opacity: 0;
    }

    .bar:nth-child(3) {
      top: -9px;
      -webkit-transform: rotate(-45deg);
      transform: rotate(-45deg);
    }
  }
}

.mobile-menu-visible {
  display: flex;
  justify-content: center;
  width: 100%;
  list-style-type: none;
  position: absolute;
  top: 80px;
  position: fixed;
  z-index: 9999;

  .mobile-menu-links {
    list-style-type: none;
    padding: 5px;
    background-color: white;
    width: 95%;
    background: #ffffff;
    padding: 30px;
    border-radius: 5px;

    li {
      padding: 5px;
      border-radius: 5px;
      width: 100%;

      &:hover {
        color: white;
        background-color: gray;
      }

      a {
        width: 100%;
        color: inherit;

        &:hover {
          color: #ffffff !important;
        }
      }
    }



  }
}

.mobile-menu-hidden {
  display: none;
}

@media screen and (max-width: 650px) {
  .nav-links {
    display: none;
  }

  .burger {
    display: block;
  }

  .nav {

    a {
      font-size: 18px;
      line-height: 0;
    }
  }
}

.scroll-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background-color: #7d37e1;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: opacity 0.3s ease;
}

.scroll-to-top:hover {
  background-color: #6a2bc4;
}

@media screen and (min-width: 650px) {
  .mobile-menu-visible {
    display: none;
  }
}
</style>
