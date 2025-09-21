<template>
  <div class="app-container">
    <NavBar :menu-list="menuList" :current-link="currentLink"></NavBar>

    <RouterView></RouterView>

  </div>
</template>

<script setup>
import NavBar from "./components/shared/NavBar.vue";
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useStore } from "vuex";

const store = useStore();

const view = computed(() => store.state.navigation.view)

const menuList = computed(() => {

  if (view.value !== "landing") {
    return [];
  }

  let menu = [
    { name: 'Home', link: '#home' },
    { name: 'Customer', link: '#customer' },
    { name: 'Admin', link: '#admin' },
    { name: 'Contact', link: '#contact' }
  ]

  return menu;
})

const currentLink = ref('home');


const scrollPosition = ref(0);


const handleScroll = () => {
  scrollPosition.value = window.scrollY || window.pageYOffset;

  const sections = ['home', 'customer', 'admin', 'contact'];


  for (const section of sections) {
    const element = document.getElementById(section);
    if (element) {
      const rect = element.getBoundingClientRect();
      const offset = 120;
      if (rect.top?.toFixed() <= offset && rect.bottom?.toFixed() >= offset) {
        currentLink.value = section;
      }
    }
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});


</script>

<style scoped>
.app-container {
  display: block;
  flex-direction: column;
  gap: 35px;
  min-height: 100vh;
  /* min-height: 200vh; */
  height: fit-content;
  background: url("/background-header-landing.png");
  background-repeat: no-repeat;
  background-position: top -300px center;

}
</style>