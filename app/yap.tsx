import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import * as Yup from 'yup';
import { Formik } from 'formik';
import DateTimePicker from '@react-native-community/datetimepicker';

// Validation schema using Yup
const SignupSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('First name is required'),
  middleName: Yup.string()
    .max(50, 'Too Long!'),
  lastName: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Last name is required'),
  birthday: Yup.date()
    .required('Birthday is required')
    .max(new Date(), 'Birthday cannot be in the future'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  gender: Yup.string()
    .oneOf(['male', 'female', 'other', 'prefer not to say'], 'Please select a valid option')
    .required('Gender is required'),
  username: Yup.string()
    .min(4, 'Username must be at least 4 characters')
    .max(20, 'Username must be less than 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores')
    .required('Username is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

export default function YapScreen() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // References for keyboard navigation
  const middleNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // Gender options
  const genderOptions = ['male', 'female', 'other', 'prefer not to say'];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.header}>Sign Up</Text>
        
        <Formik
          initialValues={{
            firstName: '',
            middleName: '',
            lastName: '',
            birthday: new Date(),
            email: '',
            gender: '',
            username: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={SignupSchema}
          onSubmit={(values) => {
            // Form submission logic
            Alert.alert(
              'Sign Up Successful',
              `Welcome ${values.firstName}! Your account has been created.`,
              [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
            );
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
            <View style={styles.formContainer}>
              {/* First Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your first name"
                  value={values.firstName}
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  returnKeyType="next"
                  onSubmitEditing={() => middleNameRef.current?.focus()}
                  blurOnSubmit={false}
                />
                {touched.firstName && errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}
              </View>

              {/* Middle Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Middle Name</Text>
                <TextInput
                  ref={middleNameRef}
                  style={styles.input}
                  placeholder="Enter your middle name (optional)"
                  value={values.middleName}
                  onChangeText={handleChange('middleName')}
                  onBlur={handleBlur('middleName')}
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                  blurOnSubmit={false}
                />
                {touched.middleName && errors.middleName && (
                  <Text style={styles.errorText}>{errors.middleName}</Text>
                )}
              </View>

              {/* Last Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  ref={lastNameRef}
                  style={styles.input}
                  placeholder="Enter your last name"
                  value={values.lastName}
                  onChangeText={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  returnKeyType="next"
                  onSubmitEditing={() => setShowDatePicker(true)}
                  blurOnSubmit={false}
                />
                {touched.lastName && errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                )}
              </View>

              {/* Birthday */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Birthday *</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {values.birthday.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={values.birthday}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setFieldValue('birthday', selectedDate);
                      }
                      emailRef.current?.focus();
                    }}
                  />
                )}
                {touched.birthday && errors.birthday && (
                  <Text style={styles.errorText}>{String(errors.birthday)}</Text>
                )}
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  placeholder="Enter your email"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => usernameRef.current?.focus()}
                  blurOnSubmit={false}
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              {/* Gender */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender *</Text>
                <View style={styles.genderContainer}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.genderOption,
                        values.gender === option && styles.selectedGender,
                      ]}
                      onPress={() => setFieldValue('gender', option)}
                    >
                      <Text
                        style={[
                          styles.genderText,
                          values.gender === option && styles.selectedGenderText,
                        ]}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {touched.gender && errors.gender && (
                  <Text style={styles.errorText}>{errors.gender}</Text>
                )}
              </View>

              {/* Username */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username *</Text>
                <TextInput
                  ref={usernameRef}
                  style={styles.input}
                  placeholder="Choose a username"
                  value={values.username}
                  onChangeText={handleChange('username')}
                  onBlur={handleBlur('username')}
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                />
                {touched.username && errors.username && (
                  <Text style={styles.errorText}>{errors.username}</Text>
                )}
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password *</Text>
                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  placeholder="Create a password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  blurOnSubmit={false}
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password *</Text>
                <TextInput
                  ref={confirmPasswordRef}
                  style={styles.input}
                  placeholder="Confirm your password"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={() => handleSubmit()}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity style={styles.button} onPress={() => handleSubmit()}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#34495e',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  dateButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  genderOption: {
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
  },
  selectedGender: {
    borderColor: '#3498db',
    backgroundColor: '#ebf5fb',
  },
  genderText: {
    color: '#7f8c8d',
  },
  selectedGenderText: {
    color: '#3498db',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#3498db',
    height: 50,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});