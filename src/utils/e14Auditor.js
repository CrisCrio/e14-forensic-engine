import { supabase } from './supabaseClient';

export async function fetchPollingData() {
    const { data, error } = await supabase
        .from('e14_forms')
        .select(`
        id,
        candidate_a_votes,
        candidate_b_votes,
        blank_votes,
        null_votes,
        polling_tables (
            table_number,
            registered_voters
        )
        `);

    if (error && (error.message || error.code || error.status)) {
        throw new Error(error.message || JSON.stringify(error));
    }
    return data;
}

export function calculateTotalVotes(form) {
    return (
        form.candidate_a_votes +
        form.candidate_b_votes +
        form.blank_votes +
        form.null_votes
    );
}

export function isFraudulent(form) {
    return calculateTotalVotes(form) > form.polling_tables.registered_voters;
}

export async function runForensicAudit() {
    const data = await fetchPollingData();
    const results = data.map((form) => ({
        tableNumber: form.polling_tables.table_number,
        registeredVoters: form.polling_tables.registered_voters,
        totalVotes: calculateTotalVotes(form),
        fraudDetected: isFraudulent(form),
        delta: calculateTotalVotes(form) - form.polling_tables.registered_voters,
    }));
    return { results, fraudCount: results.filter((r) => r.fraudDetected).length };
}