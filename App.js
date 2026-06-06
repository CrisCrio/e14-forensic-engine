import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { fetchPollingData, calculateTotalVotes, isFraudulent, runForensicAudit } from './src/utils/e14Auditor';

export default function App() {
  const [tables, setTables] = useState([]);
  const [auditResult, setAuditResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [log, setLog] = useState(['Sistema listo. Esperando conexión...']);

  const addLog = (msg) =>
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 5)]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    addLog('Conectando con Supabase...');
    try {
      const data = await fetchPollingData();
      setTables(data);
      addLog(`${data.length} mesas cargadas.`);
    } catch (e) {
      addLog(`ERROR: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleAudit() {
    setAuditing(true);
    addLog('Iniciando FORENSIC ENGINE...');
    try {
      const result = await runForensicAudit();
      setAuditResult(result);
      addLog(`Auditoría completa. Fraudes: ${result.fraudCount}`);
    } catch (e) {
      addLog(`FALLO: ${e.message}`);
    } finally {
      setAuditing(false);
    }
  }

  const renderTable = ({ item }) => {
    const total = calculateTotalVotes(item);
    const fraud = isFraudulent(item);
    const capacity = item.polling_tables.registered_voters;
    const mesa = item.polling_tables.table_number;

    return (
      <View style={[styles.row, fraud && styles.rowFraud]}>
        <Text style={styles.cell}>{fraud ? '⚠ ' : '✓ '}MESA {String(mesa).padStart(3, '0')}</Text>
        <Text style={styles.cell}>VOTOS: {total}/{capacity}</Text>
        <Text style={[styles.status, fraud ? styles.fraudText : styles.okText]}>
          {fraud ? '[FRAUDE]' : '[OK]'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>E-14 FORENSIC ENGINE</Text>
        <Text style={styles.subtitle}>REGISTRADURÍA — MONITOREO EN TIEMPO REAL</Text>
      </View>

      <View style={styles.logBox}>
        {log.map((l, i) => (
          <Text key={i} style={styles.logText}>{l}</Text>
        ))}
      </View>

      {auditResult && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            MESAS: {auditResult.results.length}  |  FRAUDES DETECTADOS: {auditResult.fraudCount}
          </Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color="#00FF00" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={tables}
          keyExtractor={(item) => item.id}
          renderItem={renderTable}
          style={styles.list}
          ListEmptyComponent={<Text style={styles.cell}>Sin datos. Verifica Supabase.</Text>}
        />
      )}

      <TouchableOpacity
        style={[styles.auditBtn, auditing && styles.auditBtnDisabled]}
        onPress={handleAudit}
        disabled={auditing}
      >
        {auditing
          ? <ActivityIndicator color="#000" />
          : <Text style={styles.auditBtnText}>[ RUN FORENSIC AUDIT ]</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 12, paddingTop: 50 },
  header: { paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#00FF00' },
  title: { color: '#00FF00', fontFamily: 'monospace', fontSize: 20, fontWeight: 'bold', letterSpacing: 3 },
  subtitle: { color: '#00AA00', fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, marginTop: 2 },
  logBox: { backgroundColor: '#001100', borderWidth: 1, borderColor: '#003300', padding: 8, marginTop: 10, minHeight: 80 },
  logText: { color: '#00CC00', fontFamily: 'monospace', fontSize: 10 },
  summaryBox: { backgroundColor: '#001100', borderWidth: 1, borderColor: '#00FF00', padding: 8, marginTop: 6 },
  summaryText: { color: '#00FF00', fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold' },
  list: { marginTop: 10, flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#003300' },
  rowFraud: { backgroundColor: '#0a0000' },
  cell: { color: '#00FF00', fontFamily: 'monospace', fontSize: 11, flex: 1 },
  status: { fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold', textAlign: 'right' },
  fraudText: { color: '#FF3300' },
  okText: { color: '#00FF00' },
  auditBtn: { backgroundColor: '#00FF00', padding: 16, alignItems: 'center', marginVertical: 12, borderRadius: 2 },
  auditBtnDisabled: { backgroundColor: '#005500' },
  auditBtnText: { color: '#000', fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold', letterSpacing: 3 },
});