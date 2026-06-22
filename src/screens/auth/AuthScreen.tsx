import React, { useState } from 'react';
import { View, Text, Input, XStack, YStack, styled } from 'tamagui';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../api/supabase';
import { useUserStore } from '../../store/useUserStore';

const HUDInput = styled(Input, {
  backgroundColor: '$bgSurface',
  borderColor: '$borderHairline',
  borderWidth: 1,
  borderRadius: '$2',
  color: '$textPrimary',
  fontFamily: '$body',
  fontSize: '$2',
  paddingHorizontal: '$4',
  height: 50,
  
  focusStyle: {
    borderColor: '$accentPrimary',
    borderWidth: 1,
  },
});

const isKeysConfigured =
  !!process.env.EXPO_PUBLIC_SUPABASE_URL &&
  !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.EXPO_PUBLIC_SUPABASE_URL.includes('placeholder');

export const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState<string | null>(
    !isKeysConfigured ? 'Supabase offline. Demo Mode bypass active.' : null
  );
  const [loading, setLoading] = useState(false);
  
  const setUserLoading = useUserStore((state) => state.setLoading);
  const setSession = useUserStore((state) => state.setSession);
  const updateProfile = useUserStore((state) => state.updateProfile);

  const handleDemoMode = () => {
    setLoading(true);
    setUserLoading(true);
    
    // Create a mock authenticated session for offline/local demonstration
    const mockSession = {
      access_token: 'mock-jwt-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'demo-user-uuid-0000-0000',
        email: email || 'demo@fitforge.net',
        user_metadata: { name: name || 'Demo Operator' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      },
    } as any;

    setTimeout(() => {
      updateProfile({ name: name || 'Demo Operator' });
      setSession(mockSession);
      setLoading(false);
      setUserLoading(false);
    }, 800); // 800ms loading effect for high-tech HUD immersion
  };

  const handleSubmit = async () => {
    if (!email || !password || (isSignUp && !name)) {
      setAuthError('Please fill out all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setAuthError('Invalid email address format.');
      return;
    }

    if (isSignUp) {
      if (!confirmPassword) {
        setAuthError('Please confirm your password.');
        return;
      }
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match.');
        return;
      }
    }
    
    setAuthError(null);
    setLoading(true);
    setUserLoading(true);

    if (!isKeysConfigured) {
      // Fallback to Demo Mode when keys are missing to prevent fetch errors
      handleDemoMode();
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });
        if (error) throw error;
        setAuthError('Success! Please check your email for confirmation.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
      setUserLoading(false);
    }
  };

  return (
    <View flex={1} bg="$background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <YStack gap="$6" maxW={450} w="100%" alignSelf="center">
            {/* Brand Header */}
            <YStack ai="center" gap="$2">
              <Text 
                color="$accentPrimary" 
                fontSize="$5" 
                fontFamily="$heading" 
                textShadowColor="$accentGlow"
                textShadowRadius={12}
                textShadowOffset={{ width: 0, height: 0 }}
              >
                FITFORGE
              </Text>
              <Text color="$textSecondary" fontSize="$2" fontFamily="$body">
                AUTHENTICATE SYSTEM HUD
              </Text>
            </YStack>

            {/* Tab Switcher */}
            <XStack bg="$bgSurface" br="$2" p="$1" borderWidth={1} borderColor="$borderHairline">
              <View 
                flex={1} 
                py="$2" 
                ai="center" 
                br="$1"
                bg={!isSignUp ? '$bgSurfaceRaised' : 'transparent'}
                pressStyle={{ opacity: 0.8 }}
                onPress={() => {
                  setIsSignUp(false);
                  setConfirmPassword('');
                  setAuthError(!isKeysConfigured ? 'Supabase offline. Demo Mode bypass active.' : null);
                }}
              >
                <Text 
                  fontFamily="$heading" 
                  fontSize="$2" 
                  color={!isSignUp ? '$accentPrimary' : '$textSecondary'}
                >
                  SIGN IN
                </Text>
              </View>
              <View 
                flex={1} 
                py="$2" 
                ai="center" 
                br="$1"
                bg={isSignUp ? '$bgSurfaceRaised' : 'transparent'}
                pressStyle={{ opacity: 0.8 }}
                onPress={() => {
                  setIsSignUp(true);
                  setConfirmPassword('');
                  setAuthError(!isKeysConfigured ? 'Supabase offline. Demo Mode bypass active.' : null);
                }}
              >
                <Text 
                  fontFamily="$heading" 
                  fontSize="$2" 
                  color={isSignUp ? '$accentPrimary' : '$textSecondary'}
                >
                  SIGN UP
                </Text>
              </View>
            </XStack>

            {/* Form Fields */}
            <YStack gap="$3">
              {isSignUp && (
                <YStack gap="$1">
                  <Text color="$textSecondary" fontSize="$1" fontFamily="$body">FULL NAME</Text>
                  <HUDInput 
                    placeholder="Enter your name" 
                    value={name} 
                    onChangeText={setName} 
                    autoCapitalize="words"
                  />
                </YStack>
              )}
              
              <YStack gap="$1">
                <Text color="$textSecondary" fontSize="$1" fontFamily="$body">EMAIL ADDRESS</Text>
                <HUDInput 
                  placeholder={!isKeysConfigured ? 'demo@fitforge.net' : 'operator@fitforge.net'} 
                  value={email} 
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </YStack>

              <YStack gap="$1">
                <Text color="$textSecondary" fontSize="$1" fontFamily="$body">PASSWORD</Text>
                <HUDInput 
                  placeholder="••••••••" 
                  secureTextEntry 
                  value={password} 
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </YStack>

              {isSignUp && (
                <YStack gap="$1">
                  <Text color="$textSecondary" fontSize="$1" fontFamily="$body">CONFIRM PASSWORD</Text>
                  <HUDInput 
                    placeholder="••••••••" 
                    secureTextEntry 
                    value={confirmPassword} 
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </YStack>
              )}
            </YStack>

            {/* Error Console */}
            {authError && (
              <View 
                bg="$bgSurface" 
                borderColor={authError.startsWith('Success') || authError.includes('Demo Mode') ? '$accentDim' : '$stateError'} 
                borderWidth={1} 
                br="$2" 
                p="$3"
              >
                <Text 
                  color={authError.startsWith('Success') || authError.includes('Demo Mode') ? '$accentPrimary' : '$stateError'} 
                  fontFamily="$mono" 
                  fontSize="$1"
                >
                  SYSTEM: {authError.toUpperCase()}
                </Text>
              </View>
            )}

            {/* Submit Actions */}
            <YStack gap="$3">
              <Button 
                title={loading ? 'SYNCHRONIZING...' : (isSignUp ? 'REGISTER PROFILE' : 'ACCESS HUD')} 
                onPress={handleSubmit}
                disabled={loading}
              />
              
              <Button 
                title="BYPASS TO DEMO HUD" 
                variant="secondary"
                onPress={handleDemoMode}
                disabled={loading}
              />
            </YStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
