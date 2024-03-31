import { ref, computed, inject, reactive } from 'vue'
import { defineStore } from 'pinia'

export const useTicketNumberStore = defineStore('ticketNumber', () => {
    const ticket = ref(1)

    function incrementTicket() {
        if (ticket.value == 99) {
            ticket.value = 0
        }
        ticket.value++
    }

    return { ticket, incrementTicket }
})