import * as React from "react";
import { View, Text } from "react-native";

export default function TodayPage() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>오늘 요약</Text>
      <Text style={{ marginTop: 8, color: "#666" }}>
        아직 기록 없음 (나중에 /stats 연결)
      </Text>
    </View>
  );
}
