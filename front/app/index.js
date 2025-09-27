import * as React from "react";
import { View, Text, Button, Image, Alert, FlatList, Pressable, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

// ⚠️ iOS 시뮬레이터: 127.0.0.1
// ⚠️ Android 에뮬레이터: 10.0.2.2
// ⚠️ 실기기: 맥/PC의 로컬 IP (예: 192.168.x.x)
const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:8000"
    : "http://127.0.0.1:8000";

export default function Home() {
  const [imageUri, setImageUri] = React.useState(null);
  const [candidates, setCandidates] = React.useState([]);
  const router = useRouter();

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "카메라 권한을 허용해주세요.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setCandidates([]);
    }
  };

  const uploadAndPredict = async () => {
    if (!imageUri) return;
    try {
      const form = new FormData();
      form.append("file", {
        uri: imageUri,
        name: "photo.jpg",
        type: "image/jpeg",
      });

      // ✅ RN/Expo에서는 boundary 문제 피하려고 Content-Type 수동 지정 안 하는 걸 권장
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      setCandidates(json?.candidates ?? []);
    } catch (e) {
      Alert.alert("업로드 실패", String(e));
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>CALOCUT</Text>
      <Button title="카메라 열기" onPress={openCamera} />
      {imageUri && (
        <>
          <Image
            source={{ uri: imageUri }}
            style={{
              width: 260,
              height: 260,
              borderRadius: 12,
              alignSelf: "center",
              marginTop: 8,
            }}
          />
          <Button title="서버로 업로드(예측)" onPress={uploadAndPredict} />
        </>
      )}

      {candidates.length > 0 && (
        <>
          <Text style={{ marginTop: 8, fontWeight: "700" }}>예측 후보 선택:</Text>
          <FlatList
            data={candidates}
            keyExtractor={(item, idx) => (item.label ?? "item") + idx}
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/estimate",
                    // expo-router는 객체 파라미터를 문자열로 넘기면 안정적
                    params: { candidate: JSON.stringify(item) },
                  })
                }
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                  marginTop: 8,
                }}
              >
                <Text style={{ fontSize: 16 }}>
                  {(item.display_name || item.label) ?? "Unknown"} · 확률{" "}
                  {item.prob ? Math.round(item.prob * 100) : 0}%
                </Text>
                {"kcal_per_100g" in item && (
                  <Text style={{ color: "#666" }}>
                    100g 당 {item.kcal_per_100g} kcal
                  </Text>
                )}
              </Pressable>
            )}
          />
        </>
      )}

      <Button title="오늘 요약 보기" onPress={() => router.push("/today")} />
    </View>
  );
}
