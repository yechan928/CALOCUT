import * as React from "react";
import { View, Text, TextInput, Button, Alert, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:8000"
    : "http://127.0.0.1:8000";

export default function EstimatePage() {
  const { candidate: candidateStr } = useLocalSearchParams();
  const router = useRouter();
  const candidate = candidateStr ? JSON.parse(candidateStr) : null;

  const [grams, setGrams] = React.useState("200");
  const [result, setResult] = React.useState(null);

  const calc = async () => {
    if (!candidate?.label) {
      Alert.alert("오류", "후보 정보가 없습니다.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: candidate.label,
          grams: Number(grams || 0),
        }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setResult(json);
    } catch (e) {
      Alert.alert("계산 실패", String(e));
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>
        {(candidate?.display_name || candidate?.label) ?? "항목 선택 없음"}
      </Text>

      <TextInput
        keyboardType="numeric"
        value={grams}
        onChangeText={setGrams}
        placeholder="그램(g)"
        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
      />
      <Button title="칼로리 계산" onPress={calc} />

      {result && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "700" }}>
            {result.display_name} · {result.grams}g
          </Text>
          <Text>칼로리: {result.kcal} kcal</Text>
          <Text>단백질: {result.protein_g} g</Text>
          <Text>탄수화물: {result.carb_g} g</Text>
          <Text>지방: {result.fat_g} g</Text>
        </View>
      )}

      <View style={{ marginTop: 16 }}>
        <Button title="← 뒤로" onPress={() => router.back()} />
      </View>
    </View>
  );
}
