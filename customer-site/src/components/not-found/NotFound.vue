<template>
  <v-card class="not-found-container">
    <h1>404 Not Found</h1>
    <p>We're sorry, the page you requested could not be found.</p>
  </v-card>
</template>

<script>
export default {
  name: "NotFound",
};
</script>

<style>
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 90%;
  margin: 20px;
  height: 100%;
  color: white;
}
</style>
