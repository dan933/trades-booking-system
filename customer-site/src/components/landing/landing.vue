<template>
  <div class="landing-conatiner">
    <header id="home">
      <div class="header-container">
        <div class="header-description">
          <h2 class="header-title">Customer Bookings made simple</h2>
          <p class="header-subtitle">Streamline customer scheduling and payments</p>
          <div class="demo-buttons-container">
            <a @click="() => { navigate('/org/Okq3IGUln18QM90ObeI4/auth') }" class="live-demo">Customer Demo</a>
            <a href="https://trades-booking-system-52dbc.web.app" class="live-demo">Admin Demo</a>
          </div>
        </div>
        <div class="header-image-container">
          <img class="header-image" src="/laptop.png" alt="laptop"></img>
        </div>
      </div>
    </header>
    <div class="content-container" id="about">
      <section class="content-row left">
        <div class="content-text">
          <div class="icon">
            <span class="material-symbols-outlined">
              calendar_add_on
            </span>
          </div>
          <h3 class="section-header">
            Streamline Bookings
          </h3>
          <p class="section-description">
            Effortlessly manage your bookings with our intuitive calendar system, designed to keep you organized and
            efficient.
          </p>
        </div>
        <div class="content-image">
          <img src="/appointments.png" alt="appointments" style="background-size: cover; width: 100%; height: 100%;">
        </div>
      </section>
      <section class="content-row right">
        <div class="content-image">
          <img src="/book-dates.png" alt="appointments" style="background-size: cover; width: 100%; height: 100%;">
        </div>
        <div class="content-text">
          <div class="icon">
            <span class="material-symbols-outlined">
              flex_wrap
            </span>
          </div>
          <h3 class="section-header">
            Customised Schedule
          </h3>
          <p class="section-description">
            Set your available hours and define gaps between bookings to suit your workflow. Our flexible scheduling
            options
            let you control when and how customers can book your services.
          </p>
        </div>
      </section>
      <section class="content-row left">
        <div class="content-text">
          <div class="icon">
            <span class="material-symbols-outlined">
              attach_money
            </span>
          </div>
          <h3 class="section-header">
            Payment Management
          </h3>
          <p class="section-description">
            Process payments seamlessly through our integrated platform. Customers select their preferred time slot,
            services,
            and duration. Need to cancel? Simply click to cancel appointments and automatically process customer
            refunds.
          </p>
        </div>
        <div class="content-image">
          <img src="/confirmation-booking.png" alt="appointments"
            style="background-size: cover; width: 100%; height: 100%;">
        </div>
      </section>
    </div>

  </div>

</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";


const store = useStore();
const router = useRouter();

onMounted(() => {
  store.commit("updateView", "landing");
});


const navigate = (path) => {
  store.commit("updateView", "auth");
  router.push(path);
};

</script>
<style scoped>
.landing-conatiner {
  position: relative;
  width: 100%;

  .header-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 80vh;
    min-height: fit-content;
    max-height: 800px;
    position: relative;


    .header-description {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      z-index: 2;

      .header-title {
        font-size: 60px;
        margin: 0 0 15px;
        line-height: 1.3em;
        font-weight: 700;
        color: white;
        font-family: 'Josefin Sans', sans-serif;
        text-align: center;
      }

      .header-subtitle {
        font-size: 25px;
        margin: 0 0 30px;
        padding: 0 5px;
        color: rgba(255, 255, 255, 0.8);
        font-family: 'Josefin Sans', sans-serif;
        text-align: center;
      }

      .demo-buttons-container {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;

        .live-demo {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 20px 10px;
          width: 200px;
          /* max-width: 10%; */
          height: 80px;
          background: rgb(169, 48, 228);
          border-radius: 5px;
          color: #ffffff;
          font-family: 'Josefin Sans', sans-serif;
          font-weight: 700;
          position: relative;
          z-index: 1;
          -webkit-box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.1);
          box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.1);
          overflow: hidden;
          border: none;
          text-decoration: none;
          cursor: pointer;

          &:hover {
            color: #ffffff;
            -webkit-box-shadow: 0 30px 80px -15px #A930E4;
            box-shadow: 0 20px 40px -15px #A930E4;
          }
        }
      }


    }

    .tilt {
      width: 350px;
      border-radius: 16px;

    }



    .header-image {
      display: block;
      width: auto;
      width: 400px;
      max-width: 100%;
      height: auto;
      position: relative;
      z-index: 1;
      object-fit: cover;
      transition: transform 0.5s ease, box-shadow 0.3s ease;
      transform-style: preserve-3d;

      &:hover {
        transform: perspective(1000px) rotateY(15deg) translateY(-10px) scale(1.05);
      }
    }
  }

  .content-container {
    padding-top: 200px;
    padding-bottom: 100px;
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    justify-self: center;
    gap: 40px;
    max-width: 600px;
    width: 100%;

    .content-row {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 40px;
      width: 100%;

      .content-text {
        flex: 1;
      }

      .content-image {
        width: 350px;
        height: auto;
        background: linear-gradient(135deg, #8a19fa, #A930E4);
        border-radius: 5px;
        opacity: 0.8;
        display: none;
        flex-shrink: 0;
      }

      .icon {
        display: flex;
        background-color: #8a19fa;
        width: fit-content;
        border-radius: 50%;
        padding: 10px;
        color: white;
        margin: 30px 10px;

        span {
          font-size: 40px;
        }
      }

      .section-header {
        font-size: clamp(32px, 5vw, 60px);
        line-height: 1.1em;
        font-weight: 700;
        color: #0f1d46;
        margin-bottom: 30px;
      }

      .section-description {
        font-weight: 400;
        font-size: clamp(14px, 2vw, 16px);
        line-height: 1.8em;
        font-family: 'Rubik', sans-serif;
        color: rgba(15, 29, 70, 0.6);
      }
    }
  }
}

@media screen and (min-width: 768px) {
  .landing-conatiner .content-container .content-row .content-image {
    display: block;
  }
}

@media screen and (max-width: 768px) {
  .landing-conatiner .content-container .content-row {
    padding: 15px;
    flex-direction: column;
  }
}

@media screen and (max-width: 530px) {
  .landing-conatiner .header-container .header-description .header-title {
    font-size: 30px;
  }

  .landing-conatiner .content-container .content-row {
    padding: 10px;
  }
}
</style>
