import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

type CameraMode = 'scan' | 'barcode' | 'label' | 'gallery';

export default function Imagepicker() {
    const router = useRouter();
    const [facing, setFacing] = useState<'front' | 'back'>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [activeMode, setActiveMode] = useState<CameraMode>('scan');
    const [scanned, setScanned] = useState(false);
    const [flash, setFlash] = useState<'off' | 'on'>('off');
    const cameraRef = useRef<any>(null);

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const toggleFlash = () => {
        setFlash(current => current === 'off' ? 'on' : 'off');
    };

    const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
        setScanned(true);
        Alert.alert(
            'Barcode Scanned',
            `Type: ${type}\nData: ${data}`,
            [
                {
                    text: 'OK',
                    onPress: () => setScanned(false),
                },
            ]
        );
    };

    const pickImageFromGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            router.push({
                pathname: '/screen1/scanfood/FoodDetail',
                params: { 
                    imageUri: result.assets[0].uri, 
                    mode: activeMode,
                    name: 'Chickpea curry',
                    calories: '300',
                    portion: '8 oz cooked',
                }
            });
        }
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync();
                router.push({
                    pathname: '/screen1/scanfood/FoodDetail',
                    params: { 
                        imageUri: photo.uri, 
                        mode: activeMode,
                        name: 'Chickpea curry',
                        calories: '300',
                        portion: '8 oz cooked',
                    }
                });
            } catch (error) {
                console.error('Error taking picture:', error);
            }
        }
    };

    const handleModeSelect = (mode: CameraMode) => {
        setActiveMode(mode);

        if (mode === 'gallery') {
            pickImageFromGallery();
        }
    };

    const modeConfig = {
        scan: {
            title: 'Scan Food',
            icon: 'fast-food-outline',
            description: 'Scan any food item',
            barcodeScanning: false,
            iconColor: '#fff',
        },
        barcode: {
            title: 'Barcode',
            icon: 'barcode-outline',
            description: 'Scan product barcode',
            barcodeScanning: true,
        },
        label: {
            title: 'Food Label',
            icon: 'document-text-outline',
            description: 'Scan nutrition label',
            barcodeScanning: false,
        },
        gallery: {
            title: 'Gallery',
            icon: 'images-outline',
            description: 'Choose from gallery',
            barcodeScanning: false,
        },
    };

    if (!permission) {
        return (
            <View style={styles.container}>
                <Text>Requesting camera permission...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to use the camera</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={RFValue(24)} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Food Database</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Camera Preview */}
            <View style={styles.cameraContainer}>
                {activeMode !== 'gallery' && (
                    <CameraView
                        ref={cameraRef}
                        style={styles.camera}
                        facing={facing}
                        flash={flash}
                        barcodeScannerSettings={{
                            barcodeTypes: activeMode === 'barcode' ? ['ean13', 'ean8', 'upc_a', 'upc_e'] : [],
                        }}
                        onBarcodeScanned={activeMode === 'barcode' && !scanned ? handleBarcodeScanned : undefined}
                    >
                        <View style={styles.cameraOverlay}>
                            {/* Scanner overlay based on mode */}
                            <View style={styles.scannerOverlay}>
                                {activeMode === 'scan' && (
                                    <>
                                        <Ionicons name="scan" size={RFValue(250)} color="#fff" />
                                        <View style={styles.scanFrame} />
                                    </>
                                )}

                                {activeMode === 'barcode' && (
                                    <>
                                        <View style={styles.barcodeFrame}>
                                            <View style={styles.barcodeLine} />
                                            <Text style={styles.scanText}>Align barcode within the frame</Text>
                                        </View>
                                    </>
                                )}

                                {activeMode === 'label' && (
                                    <>
                                        <View style={styles.labelFrame}>
                                            <MaterialCommunityIcons name="tag-outline" size={RFValue(40)} color="#fff" />
                                            <Text style={styles.scanText}>Position nutrition label within frame</Text>
                                        </View>
                                    </>
                                )}
                            </View>

                            <View style={styles.modeSelectorContainer}>
                                {(['scan', 'barcode', 'label', 'gallery'] as CameraMode[]).map((mode) => (
                                    <TouchableOpacity
                                        key={mode}
                                        style={[
                                            styles.modeButton,
                                            activeMode === mode && styles.modeButtonActive
                                        ]}
                                        onPress={() => handleModeSelect(mode)}
                                    >
                                        <Ionicons
                                            name={modeConfig[mode].icon as any}
                                            size={RFValue(20)}
                                            color={activeMode === mode ? '#000' : '#000'}
                                        />
                                        <Text style={[
                                            styles.modeButtonText,
                                            activeMode === mode && styles.modeButtonTextActive
                                        ]}>
                                            {modeConfig[mode].title}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Camera controls */}
                            <View style={styles.cameraControls}>
                                <TouchableOpacity
                                    style={styles.controlButton}
                                    onPress={toggleFlash}
                                >
                                    <Ionicons
                                        name={flash === 'on' ? 'flash' : 'flash-off'}
                                        size={RFValue(24)}
                                        color="#fff"
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.captureButton}
                                    onPress={takePicture}
                                >
                                    <View style={styles.captureButtonInner} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.controlButton}
                                    onPress={toggleCameraFacing}
                                >
                                    <Ionicons name="camera-reverse" size={RFValue(24)} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </CameraView>
                )}

                {activeMode === 'gallery' && (
                    <View style={styles.placeholderCamera}>
                        <Ionicons name="images-outline" size={RFValue(64)} color="#ccc" />
                        <Text style={styles.placeholderText}>Image from gallery will be processed</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('2%'),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: wp('2%'),
    },
    headerTitle: {
        fontSize: RFValue(18),
        fontWeight: '600',
        color: '#000',
    },
    placeholder: {
        width: wp('10%'),
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    placeholderCamera: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: hp('2%'),
        fontSize: RFValue(14),
        color: '#666',
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
    },
    modeSelectorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: wp('4%'),
        paddingTop: hp('3%'),
        paddingBottom: hp('2%'),
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    modeButton: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp('1.5%'),
        paddingHorizontal: wp('4%'),
        borderRadius: wp('5%'),
        backgroundColor: 'rgba(228, 222, 222, 0.71)',
        minWidth: wp('20%'),
    },
    modeButtonActive: {
        backgroundColor: 'rgba(230, 224, 224, 0.84)',
    },
    modeButtonText: {
        fontSize: RFValue(11),
        color: '#000',
        fontWeight: '500',
        marginTop: hp('0.5%'),
        textAlign: 'center',
    },
    modeButtonTextActive: {
        fontWeight: '700',
    },
    scannerOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Scan Frame (Square)
    scanFrame: {
        position: 'absolute',
        width: wp('70%'),
        height: wp('70%'),
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 10,
        backgroundColor: 'transparent',
    },
    // Barcode Frame (Rectangle)
    barcodeFrame: {
        width: wp('80%'),
        height: wp('40%'),
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 10,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    barcodeLine: {
        width: '100%',
        height: 2,
        backgroundColor: '#ff0000',
        position: 'absolute',
        top: '50%',
    },
    // Label Frame (Square)
    labelFrame: {
        width: wp('70%'),
        height: wp('70%'),
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 10,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanText: {
        color: '#fff',
        fontSize: RFValue(12),
        marginTop: hp('2%'),
        textAlign: 'center',
        fontWeight: '500',
    },
    cameraControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp('10%'),
        paddingBottom: hp('5%'),
        paddingTop: hp('1%'),
    },
    controlButton: {
        padding: wp('3%'),
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: wp('10%'),
    },
    captureButton: {
        width: wp('18%'),
        height: wp('18%'),
        borderRadius: wp('9%'),
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#4B3AAC',
    },
    captureButtonInner: {
        width: wp('14%'),
        height: wp('14%'),
        borderRadius: wp('7%'),
        backgroundColor: '#4B3AAC',
    },
    message: {
        textAlign: 'center',
        paddingBottom: hp('2%'),
    },
    button: {
        backgroundColor: '#4B3AAC',
        paddingHorizontal: wp('6%'),
        paddingVertical: hp('1.5%'),
        borderRadius: wp('3%'),
    },
    buttonText: {
        color: '#fff',
        fontSize: RFValue(14),
        fontWeight: '600',
    },
});