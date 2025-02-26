import React from "react";
import { View, Text, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import { Assessment } from "./page/Assessment";

export const LoadingScreenAdvice = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/logo/lottie/dot-wave.json")}
        autoPlay
        loop
        style={styles.lottie}
      />
      <Text style={styles.text}>กำลังค้นหาสถานพยาบาลใกล้คุณ...</Text>
      <Text style={styles.subText}>กำลังดึงข้อมูลอยู่ กรุณารอสักครู่</Text>
    </View>
  );
};

export const LoadingScreenCuteBaby = () => {
  return (
    <View style={styles.cutebabyloading}>
      <LottieView
        source={require("../assets/logo/lottie/cutebaby.json")}
        autoPlay
        loop
        style={styles.lottie}
      />
    </View>
  );
};

export const LoadingScreenHello = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/logo/lottie/hello.json")}
        autoPlay
        loop
        style={styles.helloloading}
      />
      </View>
  );
};

export const LoadingScreenStar = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/logo/lottie/star.json")}
        autoPlay
        loop
        style={styles.lottie}
      />
    </View>
  );
};




export const LoadingScreenBaby = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/logo/lottie/baby.json")}
        autoPlay
        loop
        style={styles.baby}
      />
      <Text style={styles.text}>กำลังโหลดข้อมูลเด็ก...</Text>
      <Text style={styles.subText}>กำลังดึงข้อมูลอยู่ กรุณารอสักครู่</Text>
    </View>
  );
};

export const LoadingScreenSearchfile = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/logo/lottie/glasses.json")}
        autoPlay
        loop
        style={styles.assessmentLottie}
      />
      <Text style={styles.assessmentText}>กำลังโหลดข้อมูลเด็ก...</Text>
      <Text style={styles.assessmentSubText}>
        กำลังดึงข้อมูลอยู่ กรุณารอสักครู่
      </Text>
    </View>
  );
};
export const LoadingScreenBook = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/logo/lottie/book.json")}
        autoPlay
        loop
        style={styles.assessmentLottie}
      />
      <Text style={styles.assessmentText}>กำลังโหลดการประเมิน...</Text>
      <Text style={styles.assessmentSubText}>
        กรุณารอสักครู่
      </Text>
    </View>
  );
};
export const LoadingScreenLocation = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/logo/lottie/location.json")}
        autoPlay
        loop
        style={styles.assessmentLottie}
      />
       <Text style={styles.text}>กำลังค้นหาสถานพยาบาลใกล้คุณ...</Text>
       <Text style={styles.subText}>กำลังดึงข้อมูลอยู่ กรุณารอสักครู่</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // === Base ===
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    //backgroundColor: "#fff",
    
  },

  cutebabyloading: {
    //flex: 1,
    justifyContent: "center",
    alignItems: "center",
    //backgroundColor: "#fff",
    
  },

  helloloading:{
    width: 400,
    height: 400,

  },
  baby:{
    width: 200,
    height: 200,
  },

  lottie: {
    width: 100,
    height: 100,
    //marginTop:50,
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
  },
  subText: {
    marginTop: 5,
    fontSize: 14,
    color: "#555",
  },

  // === Assessment ===
  assessmentLottie: {
    width: 200,
    height: 200,
    
  },
  assessmentText: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: "bold",
  },
  assessmentSubText: {
    marginTop: 5,
    fontSize: 14,
    color: "#555",
  },
});
