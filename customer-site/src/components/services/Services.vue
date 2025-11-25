<template>

    <div class="carousel-container">
        <v-carousel cycle height="100%" hide-delimiter-background show-arrows="hover" color="#D3D3D3">
            <v-carousel-item v-for="(slide, i) in carouselImages" :key="i">
                <div class="d-flex fill-height justify-center align-center">
                    <img class="carousel-image" :src="slide" alt="">
                </div>
            </v-carousel-item>
        </v-carousel>
    </div>
    <section class="home-section">
        <v-card elevation="3" class="card">
            <v-card-text>
                <div class="pa-3 text-body text-center">
                    As your home ages, it may no longer meet your needs or style preferences. That's where we come in.
                    Our home renovation services can help you create the home of your dreams.
                    Whether you want to update your kitchen, add a home office, or renovate your entire home, our team
                    of experienced professionals can help. We'll work with you from start to finish, ensuring that your
                    vision becomes a reality.
                    We understand that home renovations can be stressful, which is why we make the process as smooth as
                    possible. Our team will handle all of the details, from obtaining necessary permits to ensuring that
                    the work meets all safety standards.
                    Don't settle for a home that doesn't meet your needs. Contact us today to learn more about our home
                    renovation services and start transforming your space into the home of your dreams.
                </div>
            </v-card-text>
        </v-card>
    </section>
</template>

<script>
export default {
    name: "Home",
    data() {
        return {
            carouselImages: [
                "https://source.unsplash.com/TRCJ-87Yoh0/700x200",
                "https://source.unsplash.com/bIhpiQA009k/700x200"
            ]
        }
    }
}

</script>

<style scoped>
.home-section {
    display: flex;
    justify-content: center;
    max-width: 700px;
    width: 90%;
}

.carousel-image {
    width: 100%;
    border-radius: 5px;
}

.carousel-container {
    display: flex;
    max-width: 90vw;
    width: 700px;
}

.card {
    margin-top: 5px;
    padding: 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.carousel-image {
    width: 100%;
    border-radius: 5px;
}
</style>