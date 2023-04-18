import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { styles } from './styles';
import { Camera, CameraType, FaceDetectionResult } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import neutralImg from '../../assets/neutral-face.png';
import smileImg from '../../assets/grinning-squinting.png';
import winkingImg from '../../assets/winking-face.png';
import openMouth from '../../assets/open-mouth.png';

export function Home() {
  const [permissions, requestPermission] = Camera.useCameraPermissions();
  const [faceDetected, setFaceDetected] = useState(false);
  const [emoji, setEmoji] = useState(neutralImg);

  const faceValues = useSharedValue({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    rotation: 0,
  });

  function handleFacesDetected({ faces }: FaceDetectionResult) {
    const face = faces[0] as any;

    if (face) {
      const { size, origin } = face.bounds;

      faceValues.value = {
        width: size.width,
        height: size.height,
        x: origin.y,
        y: origin.y,
        rotation: face.rollAngle,
      };

      setFaceDetected(true);

      if (face.smilingProbability > 0.7) return setEmoji(smileImg);
      if (
        (face.rightEyeOpenProbability > 0.7 &&
          face.leftEyeOpenProbability < 0.2) ||
        (face.rightEyeOpenProbability < 0.2 &&
          face.leftEyeOpenProbability > 0.7)
      )
        return setEmoji(winkingImg);
      if (face.smilingProbability <= 0.69) return setEmoji(neutralImg);
      return;
    }

    setFaceDetected(false);

    // console.log(faces);
  }

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    zIndex: 1,
    width: faceValues.value.width,
    height: faceValues.value.width,
    left: faceValues.value.x,
    top: faceValues.value.y + 300,
    transform: [
      { translateX: -faceValues.value.x * 0.5 },
      { rotate: `${faceValues.value.rotation}deg` },
    ],
  }));

  useEffect(() => {
    requestPermission();

    if (!permissions?.granted) {
      return;
    }
  }, []);

  return (
    <View style={styles.container}>
      {faceDetected && <Animated.Image style={animatedStyle} source={emoji} />}
      <Camera
        style={styles.camera}
        type={CameraType.front}
        ratio="16:9"
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
    </View>
  );
}
