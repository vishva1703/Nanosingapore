// --- FILE: Imagepicker.tsx ---
import wellnessApi from '@/api/wellnessApi';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

const scanImage = require('../assets/images/Frame1.png');
const barcodeImage = require('../assets/images/Frame1.png');
const labelImage = require('../assets/images/Frame1.png');

type CameraMode = 'scan' | 'barcode' | 'label' | 'gallery';

export default function Imagepicker() {
    const router = useRouter();

    const [facing, setFacing] = useState<'front' | 'back'>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [activeMode, setActiveMode] = useState<CameraMode>('scan');
    const [scanned, setScanned] = useState(false);
    const [flash, setFlash] = useState<'off' | 'on'>('off');
    const [processing, setProcessing] = useState(false);

    const cameraRef = useRef<any>(null);

    // Request permissions
    useEffect(() => {
        if (!permission) requestPermission();
    }, [permission]);

    const toggleCameraFacing = () => setFacing(prev => prev === 'back' ? 'front' : 'back');

    const toggleFlash = () => {
        console.log("⚡ Flash toggled:", flash === 'off' ? 'on' : 'off');
        setFlash(prev => prev === 'off' ? 'on' : 'off');
    };
    
    // Helper to get current date in ISO format
    const getCurrentDate = (): string => {
        return new Date().toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    };

    const handleBarcodeScanned = async ({ type, data }: any) => {
        if (scanned) return;
        setScanned(true);
    
        Alert.alert(
            "Barcode Scanned",
            `Type: ${type}\nData: ${data}`,
            [
                {
                    text: "OK",
                    onPress: async () => {
                        try {
                            const date = getCurrentDate();
                            console.log("🚀 Calling Barcode API...", { barcode: data, date });
                            
                            const response = await wellnessApi.scanBarcode({
                                barcode: data,
                                date: date
                            });
    
                            console.log("📦 Full Barcode API response:", JSON.stringify(response, null, 2));
                            
                            // Handle various response structures
                            let result = response;
                            
                            // Try different possible response structures
                            if (response?.data?.data) {
                                result = response.data.data;
                                console.log("📦 Found response.data.data structure");
                            } else if (response?.data) {
                                result = response.data;
                                console.log("📦 Found response.data structure");
                            } else if (response?.result) {
                                result = response.result;
                                console.log("📦 Found response.result structure");
                            } else if (response?.food) {
                                result = response.food;
                                console.log("📦 Found response.food structure");
                            }
                            
                            console.log("📦 Extracted result:", JSON.stringify(result, null, 2));
                            console.log("📦 Checking for image in result:", {
                                hasImage: !!result?.image,
                                hasImageUrl: !!result?.imageUrl,
                                hasPhoto: !!result?.photo,
                                hasThumbnail: !!result?.thumbnail,
                                resultKeys: Object.keys(result || {})
                            });
                            
                            // Check if we have valid food data
                            const hasValidData = result && (
                                result.name || 
                                result.foodName || 
                                result.calories || 
                                result.nutrition ||
                                (result.data && (result.data.name || result.data.calories))
                            );
                            
                            if (!hasValidData) {
                                console.warn("⚠️ No valid food data found in response");
                                Alert.alert("Error", "Food not found for this barcode. Please try again.");
                                setScanned(false);
                                return;
                            }
                            
                            // Extract food details with comprehensive fallbacks
                            const extractNutritionValue = (data: any, key: string, altKeys: string[] = []): { value: string, unit: string } => {
                                let nutrition = data?.[key];
                                
                                if (!nutrition) {
                                    for (const altKey of altKeys) {
                                        if (data?.[altKey]) {
                                            nutrition = data[altKey];
                                            break;
                                        }
                                    }
                                }
                                
                                if (nutrition && typeof nutrition === 'object') {
                                    return {
                                        value: nutrition.value?.toString() || nutrition.amount?.toString() || '0',
                                        unit: nutrition.unit || 'g'
                                    };
                                } else if (typeof nutrition === 'number') {
                                    return {
                                        value: nutrition.toString(),
                                        unit: key === 'calories' ? 'Cal' : 'g'
                                    };
                                }
                                
                                return { value: '0', unit: key === 'calories' ? 'Cal' : 'g' };
                            };
                            
                            // Extract nutrition values
                            let caloriesData = extractNutritionValue(result, 'calories', ['calorie', 'energy']);
                            let carbsData = extractNutritionValue(result, 'carbs', ['carbohydrates', 'carb']);
                            let proteinData = extractNutritionValue(result, 'proteins', ['protein']);
                            let fatData = extractNutritionValue(result, 'fats', ['fat']);
                            
                            // Check nested nutrition object
                            if (result?.nutrition) {
                                const nutrition = result.nutrition;
                                if (nutrition.calories) {
                                    const cal = extractNutritionValue(nutrition, 'calories');
                                    if (cal.value !== '0') caloriesData = cal;
                                }
                                if (nutrition.carbs || nutrition.carbohydrates) {
                                    const carb = extractNutritionValue(nutrition, 'carbs', ['carbohydrates']);
                                    if (carb.value !== '0') carbsData = carb;
                                }
                                if (nutrition.protein || nutrition.proteins) {
                                    const prot = extractNutritionValue(nutrition, 'protein', ['proteins']);
                                    if (prot.value !== '0') proteinData = prot;
                                }
                                if (nutrition.fat || nutrition.fats) {
                                    const f = extractNutritionValue(nutrition, 'fat', ['fats']);
                                    if (f.value !== '0') fatData = f;
                                }
                            }
                            
                            // Extract food name
                            const foodName = result?.name || 
                                          result?.foodName || 
                                          result?.title || 
                                          result?.data?.name ||
                                          'Unknown Food';
                            
                            // Extract portion
                            const portion = result?.portion || 
                                          result?.servingSize || 
                                          result?.serving_size ||
                                          '1 serving';
                            
                            // Extract ingredients
                            let items: any[] = [];
                            if (result?.ingredients && Array.isArray(result.ingredients)) {
                                items = result.ingredients;
                            } else if (result?.ingredientList && Array.isArray(result.ingredientList)) {
                                items = result.ingredientList;
                            } else if (result?.items && Array.isArray(result.items)) {
                                items = result.items;
                            }
                            
                            const ingredients = items.length > 0
                                ? items.map(item => {
                                    if (typeof item === 'string') return item;
                                    if (item && typeof item === 'object') {
                                        return item.name || item.title || item.ingredient || '';
                                    }
                                    return '';
                                }).filter(name => name.trim() !== '').join(', ')
                                : '';
                            
                            // Extract health score
                            const healthScore = result?.health_score?.toString() || 
                                              result?.healthScore?.toString() || 
                                              result?.score?.toString() || 
                                              '0';
                            
                            // Extract image URL from API response with multiple fallbacks
                            let imageUri = '';
                            
                            // Try different possible image field names
                            const imageFields = [
                                'image', 'imageUrl', 'image_url', 'photo', 'photoUrl', 
                                'thumbnail', 'thumbnailUrl', 'picture', 'pictureUrl',
                                'img', 'imgUrl', 'url'
                            ];
                            
                            // Check in result object
                            for (const field of imageFields) {
                                if (result?.[field]) {
                                    if (typeof result[field] === 'string') {
                                        imageUri = result[field];
                                        console.log(`📸 Found image in result.${field}:`, imageUri);
                                        break;
                                    } else if (result[field]?.url) {
                                        imageUri = result[field].url;
                                        console.log(`📸 Found image in result.${field}.url:`, imageUri);
                                        break;
                                    } else if (result[field]?.uri) {
                                        imageUri = result[field].uri;
                                        console.log(`📸 Found image in result.${field}.uri:`, imageUri);
                                        break;
                                    }
                                }
                            }
                            
                            // If not found, check in result.data
                            if (!imageUri && result?.data) {
                                for (const field of imageFields) {
                                    if (result.data[field]) {
                                        if (typeof result.data[field] === 'string') {
                                            imageUri = result.data[field];
                                            console.log(`📸 Found image in result.data.${field}:`, imageUri);
                                            break;
                                        } else if (result.data[field]?.url) {
                                            imageUri = result.data[field].url;
                                            console.log(`📸 Found image in result.data.${field}.url:`, imageUri);
                                            break;
                                        }
                                    }
                                }
                            }
                            
                            // If image URL is relative, make it absolute (if needed)
                            if (imageUri && !imageUri.startsWith('http') && !imageUri.startsWith('file://')) {
                                // If it's a relative path, you might need to prepend base URL
                                // For now, we'll use it as is since API might return full URLs
                                console.log("📸 Image URI is relative path:", imageUri);
                            }
                            
                            console.log("✅ Extracted barcode food data:", {
                                foodName,
                                calories: `${caloriesData.value}${caloriesData.unit}`,
                                carbs: `${carbsData.value}${carbsData.unit}`,
                                protein: `${proteinData.value}${proteinData.unit}`,
                                fat: `${fatData.value}${fatData.unit}`,
                                portion,
                                ingredients,
                                healthScore,
                                imageUri: imageUri || 'No image found in response'
                            });
    
                            // Fix/Update scan result via API
                            try {
                                const fixPayload = {
                                    mode: "barcode",
                                    barcode: data,
                                    name: foodName,
                                    calories: caloriesData.value,
                                    caloriesUnit: caloriesData.unit,
                                    carbs: carbsData.value,
                                    carbsUnit: carbsData.unit,
                                    protein: proteinData.value,
                                    proteinUnit: proteinData.unit,
                                    fat: fatData.value,
                                    fatUnit: fatData.unit,
                                    portion: portion,
                                    ingredients: ingredients,
                                    healthScore: healthScore,
                                    imageUri: imageUri || "",
                                    date: getCurrentDate(),
                                };
                                console.log("🔧 Calling fixScanResult API...", fixPayload);
                                await wellnessApi.fixScanResult(fixPayload);
                                console.log("✅ Scan result fixed successfully");
                            } catch (fixError: any) {
                                console.warn("⚠️ Failed to fix scan result:", fixError);
                                // Continue navigation even if fix fails
                            }
    
                            // Navigate to FoodDetail with all extracted data
                            router.push({
                                pathname: "/screen1/scanfood/FoodDetail",
                                params: {
                                  imageUri: imageUri || "",
                                  mode: "barcode",
                                  barcode: String(data || ""),
                              
                                  name: foodName || "Unknown",
                                  
                                  calories: String(caloriesData?.value ?? 0),
                                  caloriesUnit: caloriesData?.unit || "Cal",
                              
                                  carbs: String(carbsData?.value ?? 0),
                                  carbsUnit: carbsData?.unit || "g",
                              
                                  protein: String(proteinData?.value ?? 0),
                                  proteinUnit: proteinData?.unit || "g",
                              
                                  fat: String(fatData?.value ?? 0),
                                  fatUnit: fatData?.unit || "g",
                              
                                  ingredients: JSON.stringify(ingredients || []),
                              
                                  portion:
                                    typeof portion === "string"
                                      ? portion
                                      : JSON.stringify(portion || {}),
                              
                                  healthScore: String(healthScore ?? 0),
                              
                                  apiResponse: JSON.stringify(result || {}),
                                },
                              });
                              
    
                        } catch (err: any) {
                            console.error("❌ Barcode scan error:", err);
                            console.error("❌ Error details:", {
                                message: err?.message,
                                response: err?.response?.data,
                                status: err?.response?.status
                            });
                            Alert.alert(
                                "Error", 
                                err?.response?.data?.message || err?.message || "Failed to fetch food details. Please try again."
                            );
                        } finally {
                            setScanned(false);
                        }
                    }
                }
            ]
        );
    };
    

    const pickImageFromGallery = async () => {
        if (processing) {
            console.log("⏳ Already processing, please wait...");
            return;
        }

        try {
            setProcessing(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                setProcessing(false);
                return;
            }

            const imageUri = result.assets[0].uri;
            console.log("📸 Image selected from gallery:", imageUri);

            const today = getCurrentDate();
            console.log("📅 Using date:", today);

            // Use scan mode API to analyze the image
            try {
                console.log("🚀 Uploading gallery image to Scan Food API...", { imageUri, date: today });
                const response = await wellnessApi.scanFood(imageUri, today);

                console.log("📦 Full Gallery Scan API Response:", JSON.stringify(response, null, 2));

                // Handle various response structures
                let result = response;
                if (response?.data?.data) {
                    result = response.data.data;
                    console.log("📦 Found response.data.data structure");
                } else if (response?.data) {
                    result = response.data;
                    console.log("📦 Found response.data structure");
                } else if (response?.result) {
                    result = response.result;
                    console.log("📦 Found response.result structure");
                }

                if (!result || (!result.name && !result.calories && !result.nutrition)) {
                    console.warn("⚠️ Invalid gallery scan response:", result);
                    Alert.alert("Error", "Unable to detect food from image. Please try again with a clearer image.");
                    setProcessing(false);
                    return;
                }

                // Extract nutrition values with comprehensive fallbacks
                const extractNutritionValue = (data: any, key: string, altKeys: string[] = []): { value: string, unit: string } => {
                    let nutrition = data?.[key];
                    
                    if (!nutrition) {
                        for (const altKey of altKeys) {
                            if (data?.[altKey]) {
                                nutrition = data[altKey];
                                break;
                            }
                        }
                    }
                    
                    if (nutrition && typeof nutrition === 'object') {
                        return {
                            value: nutrition.value?.toString() || nutrition.amount?.toString() || '0',
                            unit: nutrition.unit || 'g'
                        };
                    } else if (typeof nutrition === 'number') {
                        return {
                            value: nutrition.toString(),
                            unit: key === 'calories' ? 'Cal' : 'g'
                        };
                    }
                    
                    return { value: '0', unit: key === 'calories' ? 'Cal' : 'g' };
                };

                // Extract all nutrition values
                let caloriesData = extractNutritionValue(result, 'calories', ['calorie', 'energy']);
                let carbsData = extractNutritionValue(result, 'carbs', ['carbohydrates', 'carb']);
                let proteinData = extractNutritionValue(result, 'proteins', ['protein']);
                let fatData = extractNutritionValue(result, 'fats', ['fat']);
                
                // Check nested nutrition object
                if (result?.nutrition) {
                    const nutrition = result.nutrition;
                    if (nutrition.calories) {
                        const cal = extractNutritionValue(nutrition, 'calories');
                        if (cal.value !== '0') caloriesData = cal;
                    }
                    if (nutrition.carbs || nutrition.carbohydrates) {
                        const carb = extractNutritionValue(nutrition, 'carbs', ['carbohydrates']);
                        if (carb.value !== '0') carbsData = carb;
                    }
                    if (nutrition.protein || nutrition.proteins) {
                        const prot = extractNutritionValue(nutrition, 'protein', ['proteins']);
                        if (prot.value !== '0') proteinData = prot;
                    }
                    if (nutrition.fat || nutrition.fats) {
                        const f = extractNutritionValue(nutrition, 'fat', ['fats']);
                        if (f.value !== '0') fatData = f;
                    }
                }

                // Extract food name
                const foodName = result.name || 
                              result.foodName || 
                              result.title || 
                              result.data?.name ||
                              'Unknown Food';

                // Extract portion
                const portion = result.portion || 
                              result.servingSize || 
                              result.serving_size ||
                              '1 serving';

                // Extract ingredients
                let items: any[] = [];
                if (result?.ingredients && Array.isArray(result.ingredients)) {
                    items = result.ingredients;
                } else if (result?.ingredientList && Array.isArray(result.ingredientList)) {
                    items = result.ingredientList;
                } else if (result?.items && Array.isArray(result.items)) {
                    items = result.items;
                }
                
                const ingredients = items.length > 0
                    ? items.map(item => {
                        if (typeof item === 'string') return item;
                        if (item && typeof item === 'object') {
                            return item.name || item.title || item.ingredient || '';
                        }
                        return '';
                    }).filter(name => name.trim() !== '').join(', ')
                    : '';

                // Extract health score
                const healthScore = result?.health_score?.toString() || 
                                  result?.healthScore?.toString() || 
                                  result?.score?.toString() || 
                                  '0';

                // Extract image URI from response
                let extractedImageUri = imageUri; // Default to selected image
                const imageKeys = ['image', 'imageUrl', 'image_url', 'photo', 'photoUrl', 'thumbnail', 'thumbnailUrl', 'picture', 'pictureUrl', 'img', 'imgUrl', 'url'];
                for (const key of imageKeys) {
                    if (result?.[key]) {
                        if (typeof result[key] === 'string') {
                            extractedImageUri = result[key];
                            console.log(`📸 Found image in result.${key}:`, extractedImageUri);
                            break;
                        } else if (typeof result[key] === 'object' && (result[key].url || result[key].uri)) {
                            extractedImageUri = result[key].url || result[key].uri;
                            console.log(`📸 Found image object in result.${key}:`, extractedImageUri);
                            break;
                        }
                    }
                    if (result?.data?.[key]) {
                        if (typeof result.data[key] === 'string') {
                            extractedImageUri = result.data[key];
                            console.log(`📸 Found image in result.data.${key}:`, extractedImageUri);
                            break;
                        } else if (typeof result.data[key] === 'object' && (result.data[key].url || result.data[key].uri)) {
                            extractedImageUri = result.data[key].url || result.data[key].uri;
                            console.log(`📸 Found image object in result.data.${key}:`, extractedImageUri);
                            break;
                        }
                    }
                }

                console.log("✅ Extracted gallery food data:", {
                    foodName,
                    calories: `${caloriesData.value}${caloriesData.unit}`,
                    carbs: `${carbsData.value}${carbsData.unit}`,
                    protein: `${proteinData.value}${proteinData.unit}`,
                    fat: `${fatData.value}${fatData.unit}`,
                    portion,
                    ingredients,
                    healthScore,
                    imageUri: extractedImageUri
                });

                // Fix/Update scan result via API
                try {
                    const fixPayload = {
                        mode: "gallery",
                        imageUri: extractedImageUri,
                        name: foodName,
                        calories: caloriesData.value,
                        caloriesUnit: caloriesData.unit,
                        carbs: carbsData.value,
                        carbsUnit: carbsData.unit,
                        protein: proteinData.value,
                        proteinUnit: proteinData.unit,
                        fat: fatData.value,
                        fatUnit: fatData.unit,
                        portion: typeof portion === 'string' ? portion : JSON.stringify(portion),
                        ingredients: ingredients,
                        healthScore: healthScore,
                        date: today,
                    };
                    console.log("🔧 Calling fixScanResult API for gallery...", fixPayload);
                    await wellnessApi.fixScanResult(fixPayload);
                    console.log("✅ Gallery scan result fixed successfully");
                } catch (fixError: any) {
                    console.warn("⚠️ Failed to fix gallery scan result:", fixError);
                    // Continue navigation even if fix fails
                }

                router.push({
                    pathname: '/screen1/scanfood/FoodDetail',
                    params: {
                        mode: "gallery",
                        imageUri: extractedImageUri,
                        name: foodName,
                        calories: caloriesData.value,
                        caloriesUnit: caloriesData.unit,
                        carbs: carbsData.value,
                        carbsUnit: carbsData.unit,
                        protein: proteinData.value,
                        proteinUnit: proteinData.unit,
                        fat: fatData.value,
                        fatUnit: fatData.unit,
                        portion: typeof portion === 'string' ? portion : JSON.stringify(portion),
                        ingredients: ingredients,
                        healthScore: healthScore,
                        apiResponse: JSON.stringify(result),
                    }
                });

            } catch (galleryError: any) {
                console.error("❌ Gallery scan error:", galleryError);
                console.error("❌ Error details:", {
                    message: galleryError?.message,
                    response: galleryError?.response?.data,
                    status: galleryError?.response?.status
                });
                Alert.alert(
                    "Error",
                    galleryError?.response?.data?.message || galleryError?.message || "Failed to scan food from gallery. Please try again."
                );
            }

        } catch (error: any) {
            console.error("❌ Gallery picker error:", error);
            Alert.alert(
                "Error",
                error?.message || "Failed to pick image from gallery. Please try again."
            );
        } finally {
            setProcessing(false);
        }
    };
    const takePicture = async () => {
        if (!cameraRef.current) {
            console.error("❌ Camera ref not available");
            Alert.alert("Error", "Camera not ready. Please try again.");
            return;
        }

        if (processing) {
            console.log("⏳ Already processing, please wait...");
            return;
        }
      
        try {
          setProcessing(true);
          console.log(`📸 Taking picture in ${activeMode} mode...`);
          const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
          
          if (!photo || !photo.uri) {
            console.error("❌ Photo capture failed - no URI");
            Alert.alert("Error", "Failed to capture image. Please try again.");
            return;
          }
      
          console.log("📸 Photo captured:", photo.uri);
          
          // Skip file existence check - if photo was captured, it exists
          // FileSystem.getInfoAsync is deprecated in newer Expo versions
          // The photo URI is valid if capture succeeded
      
          const today = new Date().toISOString().split("T")[0];
          console.log("📅 Using date:", today);
      
          // 🔥 LABEL SCAN API
          if (activeMode === "label") {
            try {
              console.log("🚀 Uploading image to Label Scan API...", { imageUri: photo.uri, date: today });
              const response = await wellnessApi.scanFoodLabel(photo.uri, today);
      
              console.log("📦 Full Label API Response:", JSON.stringify(response, null, 2));
              console.log("📦 Response type:", typeof response);
              console.log("📦 Response keys:", Object.keys(response || {}));
      
              // Handle various response structures - similar to scanFood
              let result = response;
              
              // Check if response has wrapper structure
              if (response?.success !== undefined || response?.flag !== undefined) {
                if (response?.data && typeof response.data === 'object') {
                  console.log("📦 Found wrapped response with data property");
                  result = response.data;
                }
              }
              
              // Try different possible response structures
              if (result?.data?.data) {
                result = result.data.data;
                console.log("📦 Found result.data.data structure");
              } else if (result?.data) {
                // Check if result.data has actual food data
                const dataObj = result.data;
                if (dataObj.name || dataObj.foodName || dataObj.calories || dataObj.nutrition) {
                  console.log("📦 Found result.data with food information");
                  result = dataObj;
                }
              } else if (result?.result) {
                result = result.result;
                console.log("📦 Found result.result structure");
              } else if (result?.food) {
                result = result.food;
                console.log("📦 Found result.food structure");
              }
      
              console.log("📦 Extracted result:", JSON.stringify(result, null, 2));
      
              // More lenient validation - check if we have any food data at all
              const hasValidData = result && (
                result.name || 
                result.foodName || 
                result.title ||
                result.calories || 
                result.nutrition ||
                result.carbs ||
                result.proteins ||
                result.fats ||
                (result.data && (result.data.name || result.data.calories))
              );
      
              if (!hasValidData) {
                console.warn("⚠️ No valid food data found in label scan response");
                console.warn("⚠️ Full response:", JSON.stringify(response, null, 2));
                Alert.alert(
                  "Unable to Scan Label",
                  "The nutrition label could not be read. Please ensure:\n\n• The label is clearly visible\n• There's good lighting\n• The image is not blurry\n• The entire label is in frame\n\nTry again with a clearer image.",
                  [{ text: 'OK' }]
                );
                return;
              }
      
              // Extract nutrition values with comprehensive fallbacks
              const extractNutritionValue = (data: any, key: string, altKeys: string[] = []): { value: string, unit: string } => {
                let nutrition = data?.[key];
                
                if (!nutrition) {
                  for (const altKey of altKeys) {
                    if (data?.[altKey]) {
                      nutrition = data[altKey];
                      break;
                    }
                  }
                }
                
                if (nutrition && typeof nutrition === 'object') {
                  return {
                    value: nutrition.value?.toString() || nutrition.amount?.toString() || '0',
                    unit: nutrition.unit || 'g'
                  };
                } else if (typeof nutrition === 'number') {
                  return {
                    value: nutrition.toString(),
                    unit: key === 'calories' ? 'Cal' : 'g'
                  };
                }
                
                return { value: '0', unit: key === 'calories' ? 'Cal' : 'g' };
              };
      
              // Extract all nutrition values
              let caloriesData = extractNutritionValue(result, 'calories', ['calorie', 'energy']);
              let carbsData = extractNutritionValue(result, 'carbs', ['carbohydrates', 'carb']);
              let proteinData = extractNutritionValue(result, 'proteins', ['protein']);
              let fatData = extractNutritionValue(result, 'fats', ['fat']);
              
              // Check nested nutrition object
              if (result?.nutrition) {
                const nutrition = result.nutrition;
                if (nutrition.calories) {
                  const cal = extractNutritionValue(nutrition, 'calories');
                  if (cal.value !== '0') caloriesData = cal;
                }
                if (nutrition.carbs || nutrition.carbohydrates) {
                  const carb = extractNutritionValue(nutrition, 'carbs', ['carbohydrates']);
                  if (carb.value !== '0') carbsData = carb;
                }
                if (nutrition.protein || nutrition.proteins) {
                  const prot = extractNutritionValue(nutrition, 'protein', ['proteins']);
                  if (prot.value !== '0') proteinData = prot;
                }
                if (nutrition.fat || nutrition.fats) {
                  const f = extractNutritionValue(nutrition, 'fat', ['fats']);
                  if (f.value !== '0') fatData = f;
                }
              }
      
              // Extract food name
              const foodName = result.name || 
                            result.foodName || 
                            result.title || 
                            result.data?.name ||
                            'Nutrition Label';
      
              // Extract portion
              const portion = result.portion || 
                            result.servingSize || 
                            result.serving_size ||
                            '1 serving';
      
              // Extract ingredients
              let items: any[] = [];
              if (result?.ingredients && Array.isArray(result.ingredients)) {
                items = result.ingredients;
              } else if (result?.ingredientList && Array.isArray(result.ingredientList)) {
                items = result.ingredientList;
              } else if (result?.items && Array.isArray(result.items)) {
                items = result.items;
              }
              
              const ingredients = items.length > 0
                ? items.map(item => {
                    if (typeof item === 'string') return item;
                    if (item && typeof item === 'object') {
                      return item.name || item.title || item.ingredient || '';
                    }
                    return '';
                  }).filter(name => name.trim() !== '').join(', ')
                : '';
      
              // Extract health score
              const healthScore = result?.health_score?.toString() || 
                                result?.healthScore?.toString() || 
                                result?.score?.toString() || 
                                '0';
      
              console.log("✅ Extracted label food data:", {
                foodName,
                calories: `${caloriesData.value}${caloriesData.unit}`,
                carbs: `${carbsData.value}${carbsData.unit}`,
                protein: `${proteinData.value}${proteinData.unit}`,
                fat: `${fatData.value}${fatData.unit}`,
                portion,
                ingredients,
                healthScore
              });
      
              // Fix/Update scan result via API
              try {
                const fixPayload = {
                  mode: "label",
                  imageUri: photo.uri,
                  name: foodName,
                  calories: caloriesData.value,
                  caloriesUnit: caloriesData.unit,
                  carbs: carbsData.value,
                  carbsUnit: carbsData.unit,
                  protein: proteinData.value,
                  proteinUnit: proteinData.unit,
                  fat: fatData.value,
                  fatUnit: fatData.unit,
                  portion: typeof portion === 'string' ? portion : JSON.stringify(portion),
                  ingredients: ingredients,
                  healthScore: healthScore,
                  date: today,
                };
                console.log("🔧 Calling fixScanResult API for label...", fixPayload);
                await wellnessApi.fixScanResult(fixPayload);
                console.log("✅ Label scan result fixed successfully");
              } catch (fixError: any) {
                console.warn("⚠️ Failed to fix label scan result:", fixError);
                // Continue navigation even if fix fails
              }
      
              router.push({
                pathname: "/screen1/scanfood/FoodDetail",
                params: {
                  mode: "label",
                  imageUri: photo.uri,
                  name: foodName,
                  calories: caloriesData.value,
                  caloriesUnit: caloriesData.unit,
                  carbs: carbsData.value,
                  carbsUnit: carbsData.unit,
                  protein: proteinData.value,
                  proteinUnit: proteinData.unit,
                  fat: fatData.value,
                  fatUnit: fatData.unit,
                  portion: typeof portion === 'string' ? portion : JSON.stringify(portion),
                  ingredients: ingredients,
                  healthScore: healthScore,
                  apiResponse: JSON.stringify(result),
                },
              });
            } catch (labelError: any) {
              console.error("❌ Label scan error:", labelError);
              console.error("❌ Error details:", {
                message: labelError?.message,
                response: labelError?.response?.data,
                status: labelError?.response?.status,
                statusText: labelError?.response?.statusText
              });
              
              const errorMessage = labelError?.response?.data?.message || 
                                 labelError?.message || 
                                 "Failed to scan nutrition label.";
              
              Alert.alert(
                "Unable to Scan Label",
                `${errorMessage}\n\nPlease ensure:\n• The label is clearly visible\n• Good lighting\n• Image is not blurry\n• Entire label is in frame`,
                [{ text: 'OK' }]
              );
            }
            return;
          }
      
          // 🔥 FOOD IMAGE SCAN API
          if (activeMode === "scan") {
            try {
              console.log("🚀 Uploading image to Scan Food API...", { imageUri: photo.uri, date: today });
              const response = await wellnessApi.scanFood(photo.uri, today);
      
              console.log("📦 Full Scan API Response:", JSON.stringify(response, null, 2));
      
              // Handle various response structures
              let result = response;
              if (response?.data?.data) {
                result = response.data.data;
                console.log("📦 Found response.data.data structure");
              } else if (response?.data) {
                result = response.data;
                console.log("📦 Found response.data structure");
              } else if (response?.result) {
                result = response.result;
                console.log("📦 Found response.result structure");
              }
      
              if (!result || (!result.name && !result.calories && !result.nutrition)) {
                console.warn("⚠️ Invalid scan response:", result);
                Alert.alert("Error", "Unable to detect food. Please try again with a clearer image.");
                return;
              }
      
              // Extract food details
              const foodName = result.name || result.foodName || result.title || 'Unknown Food';
              const calories = result.calories?.value?.toString() || 
                             (typeof result.calories === 'number' ? result.calories.toString() : '0');
              const caloriesUnit = result.calories?.unit || 'Cal';
              const portion = result.portion || result.servingSize || '1 serving';
              const ingredients = result.items || result.ingredients || [];
      
              // Fix/Update scan result via API
              try {
                const fixPayload = {
                  mode: "scan",
                  imageUri: photo.uri,
                  name: foodName,
                  calories: calories,
                  caloriesUnit: caloriesUnit,
                  carbs: result.carbs?.value?.toString() || result.carbs?.toString() || '0',
                  carbsUnit: result.carbs?.unit || 'g',
                  protein: result.proteins?.value?.toString() || result.protein?.toString() || '0',
                  proteinUnit: result.proteins?.unit || result.protein?.unit || 'g',
                  fat: result.fats?.value?.toString() || result.fat?.toString() || '0',
                  fatUnit: result.fats?.unit || result.fat?.unit || 'g',
                  portion: portion,
                  ingredients: Array.isArray(ingredients) ? ingredients.map(i => typeof i === 'string' ? i : i.name || '').join(', ') : ingredients,
                  healthScore: result.health_score?.toString() || result.healthScore?.toString() || '0',
                  date: today,
                };
                console.log("🔧 Calling fixScanResult API for scan...", fixPayload);
                await wellnessApi.fixScanResult(fixPayload);
                console.log("✅ Scan result fixed successfully");
              } catch (fixError: any) {
                console.warn("⚠️ Failed to fix scan result:", fixError);
                // Continue navigation even if fix fails
              }
      
              router.push({
                pathname: "/screen1/scanfood/FoodDetail",
                params: {
                  mode: "scan",
                  imageUri: photo.uri,
                  name: foodName,
                  calories: calories,
                  caloriesUnit: caloriesUnit,
                  carbs: result.carbs?.value?.toString() || result.carbs?.toString() || '0',
                  carbsUnit: result.carbs?.unit || 'g',
                  protein: result.proteins?.value?.toString() || result.protein?.toString() || '0',
                  proteinUnit: result.proteins?.unit || result.protein?.unit || 'g',
                  fat: result.fats?.value?.toString() || result.fat?.toString() || '0',
                  fatUnit: result.fats?.unit || result.fat?.unit || 'g',
                  portion: portion,
                  ingredients: Array.isArray(ingredients) ? ingredients.map(i => typeof i === 'string' ? i : i.name || '').join(', ') : ingredients,
                  healthScore: result.health_score?.toString() || result.healthScore?.toString() || '0',
                  apiResponse: JSON.stringify(result),
                },
              });
            } catch (scanError: any) {
              console.error("❌ Scan error:", scanError);
              console.error("❌ Error details:", {
                message: scanError?.message,
                response: scanError?.response?.data,
                status: scanError?.response?.status
              });
              Alert.alert(
                "Error",
                scanError?.response?.data?.message || scanError?.message || "Failed to scan food. Please try again."
              );
            }
            return;
          }
      
          // Barcode mode uses handleBarcodeScanned (no capture needed)
          console.log("ℹ️ Barcode mode - no picture capture needed");
      
        } catch (error: any) {
          console.error("❌ takePicture error:", error);
          console.error("❌ Error stack:", error?.stack);
          console.error("❌ Error details:", {
            message: error?.message,
            code: error?.code,
            name: error?.name,
            response: error?.response?.data,
            status: error?.response?.status
          });
          Alert.alert(
            "Error",
            error?.response?.data?.message || error?.message || "Could not process image. Please check your camera permissions and try again."
          );
        } finally {
          setProcessing(false);
        }
      };
      
      
    const handleModeSelect = (mode: CameraMode) => {
        setActiveMode(mode);
        if (mode === "gallery") pickImageFromGallery();
    };

    if (!permission) {
        return (
            <View style={styles.centered}>
                <Text>Requesting camera permissions...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.centered}>
                <Text style={styles.message}>
                    We need your permission to use the camera
                </Text>
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
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={RFValue(22)} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Food Database</Text>
                <View style={{ width: wp('10%') }} />
            </View>

            {/* CAM VIEW */}
            <View style={styles.cameraContainer}>
                {activeMode !== "gallery" ? (
                    <CameraView
                        ref={cameraRef}
                        style={styles.camera}
                        facing={facing}
                        flash={flash}
                        barcodeScannerSettings={{
                            barcodeTypes:
                                activeMode === "barcode"
                                    ? ['ean13', 'ean8', 'upc_a', 'upc_e']
                                    : [],
                        }}
                        onBarcodeScanned={
                            activeMode === "barcode" && !scanned
                                ? handleBarcodeScanned
                                : undefined
                        }
                    >

                        {/* Overlay */}
                        <View style={styles.overlay}>
                            <View style={styles.scannerBox}>
                                {activeMode === "scan" && (
                                    <Image source={scanImage} style={styles.scanImageStyle} />
                                )}

                                {activeMode === "barcode" && (
                                    <Image source={barcodeImage} style={styles.barcodeImageStyle} />
                                )}

                                {activeMode === "label" && (
                                    <Image source={labelImage} style={styles.labelImageStyle} />
                                )}
                            </View>

                            {/* Mode Selection */}
                            <View style={styles.modeSelector}>
                                {(['scan', 'barcode', 'label', 'gallery'] as CameraMode[]).map(mode => (
                                    <TouchableOpacity
                                        key={mode}
                                        onPress={() => handleModeSelect(mode)}
                                        style={[
                                            styles.modeButton,
                                            activeMode === mode && styles.activeModeButton,
                                        ]}
                                    >
                                        <Ionicons
                                            name={
                                                mode === "scan" ? "fast-food-outline" :
                                                mode === "barcode" ? "barcode-outline" :
                                                mode === "label" ? "document-text-outline" :
                                                "images-outline"
                                            }
                                            size={RFValue(18)}
                                            color="#000"
                                        />
                                        <Text style={styles.modeText}>
                                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Bottom Camera Controls */}
                            <View style={styles.cameraControls}>
                                <TouchableOpacity style={styles.controlBtn} onPress={toggleFlash}>
                                    <Ionicons
                                        name={flash === 'on' ? "flash" : "flash-off"}
                                        size={RFValue(24)}
                                        color="#fff"
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[styles.captureBtn, processing && styles.captureBtnDisabled]} 
                                    onPress={takePicture}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <ActivityIndicator size="small" color="#4B3AAC" />
                                    ) : (
                                        <View style={styles.captureInner} />
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.controlBtn} onPress={toggleCameraFacing}>
                                    <Ionicons name="camera-reverse" size={RFValue(24)} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </CameraView>
                ) : (
                    <View style={styles.galleryPlaceholder}>
                        <Ionicons name="images-outline" size={RFValue(60)} color="#888" />
                        <Text style={styles.galleryText}>Select an image from Gallery</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

// Styles
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('2%'),
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: RFValue(18), fontWeight: '600', color: '#000' },

    cameraContainer: { flex: 1, backgroundColor: '#000' },
    camera: { flex: 1 },

    overlay: { flex: 1, justifyContent: 'space-between' },

    scannerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    scanImageStyle: {
        width: wp('70%'),
        height: wp('70%'),
        resizeMode: 'contain',
    },
    barcodeImageStyle: {
        width: wp('80%'),
        height: wp('50%'),
        resizeMode: 'contain',
        transform: [{ rotate: '90deg' }],
    },
    labelImageStyle: {
        width: wp('60%'),
        height: hp('40%'),
        resizeMode: 'contain',
    },

    modeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingVertical: hp('1.5%'),
    },
    modeButton: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.6)',
        paddingVertical: hp('1%'),
        paddingHorizontal: wp('4%'),
        borderRadius: 8,
    },
    activeModeButton: {
        backgroundColor: '#fff',
    },
    modeText: {
        marginTop: hp('0.5%'),
        fontSize: RFValue(10),
        color: '#000',
    },

    cameraControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp('10%'),
        paddingBottom: hp('4%'),
    },
    controlBtn: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 50,
    },
    captureBtn: {
        width: wp('18%'),
        height: wp('18%'),
        borderRadius: wp('9%'),
        borderWidth: 3,
        borderColor: '#4B3AAC',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureBtnDisabled: {
        opacity: 0.6,
    },
    captureInner: {
        width: wp('13%'),
        height: wp('13%'),
        borderRadius: wp('7%'),
        backgroundColor: '#4B3AAC',
    },

    galleryPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f7f7f7',
    },
    galleryText: {
        marginTop: hp('2%'),
        fontSize: RFValue(14),
        color: '#666',
    },

    message: { textAlign: 'center', marginBottom: 10 },
    button: { backgroundColor: '#4B3AAC', padding: 10, borderRadius: 6 },
    buttonText: { color: '#fff' },
});
