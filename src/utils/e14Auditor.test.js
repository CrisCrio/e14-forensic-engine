import {
    calculateTotalVotes,
    isFraudulent,
    fetchPollingData,
    runForensicAudit,
} from './e14Auditor';

describe('calculateTotalVotes', () => {
    it('suma correctamente todos los votos', () => {
        const form = {
        candidate_a_votes: 80,
        candidate_b_votes: 60,
        blank_votes: 10,
        null_votes: 5,
        polling_tables: { registered_voters: 200 },
        };
        expect(calculateTotalVotes(form)).toBe(155);
    });

    it('retorna 0 si todos los votos son 0', () => {
        const form = {
        candidate_a_votes: 0,
        candidate_b_votes: 0,
        blank_votes: 0,
        null_votes: 0,
        polling_tables: { registered_voters: 200 },
        };
        expect(calculateTotalVotes(form)).toBe(0);
    });
});

describe('isFraudulent', () => {
    it('detecta fraude cuando votos superan capacidad', () => {
        const form = {
        candidate_a_votes: 200,
        candidate_b_votes: 150,
        blank_votes: 20,
        null_votes: 10,
        polling_tables: { registered_voters: 300 },
        };
        expect(isFraudulent(form)).toBe(true);
    });

    it('no marca fraude cuando votos están dentro del límite', () => {
        const form = {
        candidate_a_votes: 80,
        candidate_b_votes: 60,
        blank_votes: 10,
        null_votes: 5,
        polling_tables: { registered_voters: 200 },
        };
        expect(isFraudulent(form)).toBe(false);
    });

    it('no marca fraude cuando votos son exactamente iguales a la capacidad', () => {
        const form = {
        candidate_a_votes: 100,
        candidate_b_votes: 50,
        blank_votes: 30,
        null_votes: 20,
        polling_tables: { registered_voters: 200 },
        };
        expect(isFraudulent(form)).toBe(false);
    });
});

describe('Integración con Supabase', () => {
    it('fetchPollingData retorna un array con datos', async () => {
        try {
            const data = await fetchPollingData();
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
        } catch (e) {
            console.error('ERROR COMPLETO:', JSON.stringify(e, null, 2));
            console.error('MESSAGE:', e.message);
            console.error('CODE:', e.code);
            console.error('DETAILS:', e.details);
            throw e;
        }
        }, 15000);

    it('cada registro tiene la estructura esperada', async () => {
        const data = await fetchPollingData();
        const form = data[0];
        expect(form).toHaveProperty('candidate_a_votes');
        expect(form).toHaveProperty('candidate_b_votes');
        expect(form).toHaveProperty('blank_votes');
        expect(form).toHaveProperty('null_votes');
        expect(form).toHaveProperty('polling_tables');
        expect(form.polling_tables).toHaveProperty('registered_voters');
    }, 15000);

    it('detecta al menos 2 mesas fraudulentas', async () => {
        const { fraudCount } = await runForensicAudit();
        expect(fraudCount).toBeGreaterThanOrEqual(2);
    }, 15000);

    it('muestra las mesas fraudulentas', async () => {
    const { results, fraudCount } = await runForensicAudit();
    console.log('\n========== REPORTE FORENSE ==========');
    results.forEach((mesa) => {
        const estado = mesa.fraudDetected ? '⚠ FRAUDE' : '✓ OK';
        console.log(`MESA ${mesa.tableNumber}: ${mesa.totalVotes}/${mesa.registeredVoters} votos — ${estado} (delta: ${mesa.delta})`);
    });
    console.log(`\nTOTAL FRAUDES DETECTADOS: ${fraudCount}`);
    console.log('=====================================\n');
    expect(fraudCount).toBeGreaterThanOrEqual(2);
    }, 15000);
});