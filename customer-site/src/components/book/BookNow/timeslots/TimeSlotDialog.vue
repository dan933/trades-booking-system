<template>
    <v-dialog v-model="dialog" width="auto" persistent>
        <v-card width="900" max-width="100%" prepend-icon="mdi-clock" :title="`Schedule: ${timeTitle}`">
            <template v-slot:text>
                <div class="range-container">
                    <div class="range-btn">
                        <label>Start Time</label>
                        <v-btn icon="mdi-minus" @click="decreaseStartHour" size="small"
                            :disabled="disableStartHourDecrease"></v-btn>
                        <span>{{ hourKeys[eventForm.startHour] }}</span>
                        <v-btn icon="mdi-plus" @click="increaseStartHour" size="small"
                            :disabled="disableIncreaseStartHour"></v-btn>
                    </div>
                    <div class="range-btn">
                        <label>End Time</label>
                        <v-btn icon="mdi-minus" @click="decreaseEndHour" size="small"
                            :disabled="disableEndHourDecrease"></v-btn>
                        <span>{{ hourKeys[eventForm.endHour] }}</span>
                        <v-btn icon="mdi-plus" @click="increaseEndHour" size="small"
                            :disabled="disableEndHourIncrease"></v-btn>
                    </div>
                </div>
                <p>{{ JSON.stringify(servicesDoc) }}</p>
                <div class="services-container" v-if="services?.length">
                    <div class="service" v-for="service in services" :key="service.id">
                        <div class="range-btn">
                            <div class="service-info">
                                <div class="service-price">${{ service.rate }}/hour</div>
                                <label>{{ service.name }}</label>
                            </div>
                            <v-btn style="margin-left: auto;" icon="mdi-minus" @click="decreaseStartHour" size="small"
                                :disabled="disableStartHourDecrease"></v-btn>
                            <span>0</span>
                            <v-btn icon="mdi-plus" @click="increaseStartHour" size="small"
                                :disabled="disableIncreaseStartHour"></v-btn>
                        </div>
                    </div>
                </div>


            </template>
            <template v-slot:actions>
                <div class="action-container">
                    <v-btn class="ms-auto submit-btn" color="primary" text="Submit" @click="() => onSubmit()"></v-btn>
                    <v-btn class="ms-auto" text="Cancel" color="error" @click="() => onCancel()"></v-btn>
                </div>
            </template>
        </v-card>
    </v-dialog>
</template>
<script setup>
import { computed, ref } from 'vue';

const hourKeys = {
    0: '12 AM',
    1: '1 AM',
    2: '2 AM',
    3: '3 AM',
    4: '4 AM',
    5: '5 AM',
    6: '6 AM',
    7: '7 AM',
    8: '8 AM',
    9: '9 AM',
    10: '10 AM',
    11: '11 AM',
    12: '12 PM',
    13: '1 PM',
    14: '2 PM',
    15: '3 PM',
    16: '4 PM',
    17: '5 PM',
    18: '6 PM',
    19: '7 PM',
    20: '8 PM',
    21: '9 PM',
    22: '10 PM',
    23: '11 PM',
}

const props = defineProps({
    toggleDialog: {
        type: Function,
        default: () => { }
    },
    onSubmit: {
        type: Function,
        default: () => { }
    },
    dialog: {
        type: Boolean,
        default: false
    },
    selectedEvent: {
        type: Object,
        default: () => { }
    },
    servicesDoc: {
        type: Object,
        default: () => { }
    }
});

const dialog = ref(true);


const onCancel = () => {
    props.toggleDialog(false);
    dialog.value = false;
}

const onSubmit = () => {
    props.onSubmit(props.event);
}

const eventForm = ref({ ...props.selectedEvent });
const services = ref(
    props.servicesDoc?.services?.map((service) => {
        return {
            ...service,
            hours: 0
        }
    })
);

const disableStartHourDecrease = computed(() => {
    return eventForm.value.startHour <= props.selectedEvent.startHour;
});

const decreaseStartHour = () => {
    if (disableStartHourDecrease.value) return;
    eventForm.value.startHour--
};

const disableIncreaseStartHour = computed(() => {
    return eventForm.value.startHour + 1 >= props.selectedEvent.endHour || eventForm.value.endHour <= eventForm.value.startHour + 1;
});

const increaseStartHour = () => {
    if (disableIncreaseStartHour.value) return;
    eventForm.value.startHour++
};

const disableEndHourDecrease = computed(() => {
    return eventForm.value.endHour <= props.selectedEvent.startHour + 1 || eventForm.value.endHour <= eventForm.value.startHour + 1;
});

const decreaseEndHour = () => {
    if (disableEndHourDecrease.value) return;
    eventForm.value.endHour--
};

const disableEndHourIncrease = computed(() => {
    return eventForm.value.endHour >= props.selectedEvent.endHour;
});

const increaseEndHour = () => {
    if (disableEndHourIncrease.value) return;
    return eventForm.value.endHour++
};


const timeTitle = computed(() => {
    return new Date(eventForm.value.scheduleDate).toDateString()
});

</script>
<style scoped>
.range-container {
    display: flex;
    gap: 2rem;
    justify-content: center;
    margin: 1rem 0;
}

@media (max-width: 768px) {
    .range-container {
        flex-direction: column;
        gap: 1rem;
        align-items: center;
    }

    .range-btn {
        width: 100%;
        max-width: 260px;
        padding: 5px;
    }

    .action-container {
        flex-direction: column;
        gap: 0.5rem;
    }
}

.range-btn {
    display: flex;
    /* justify-content: space-between; */
    align-items: center;
    gap: 1rem;
    min-height: 100px;
    height: 100%;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.services-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    grid-auto-rows: 1fr;
    gap: 2rem;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    justify-items: center;
}

.service {
    width: 100%;
    max-width: 300px;
    height: 100%;
}

.service-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.service-price {
    font-size: 0.875rem;
    color: #666;
    font-weight: 500;
}
</style>
