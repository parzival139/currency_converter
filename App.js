import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Picker, Button, AsyncStorage, Alert, Image } from 'react-native';

const App = () => {
  const [inputText, setInputText] = useState('');
  const [selectedFromCurrency, setSelectedFromCurrency] = useState('default');
  const [selectedToCurrency, setSelectedToCurrency] = useState('default');
  const [showOutput, setShowOutput] = useState(false);
  const [conversionRates, setConversionRates] = useState({
    USD_EUR: 0.85,
    USD_GBP: 0.72,
    EUR_USD: 1.18,
    EUR_GBP: 0.84,
    GBP_USD: 1.39,
    GBP_EUR: 1.19,
  });
  const [lastConversion, setLastConversion] = useState('');
  const [savedInput, setSavedInput] = useState('0');
  const [savedOutput, setSavedOutput] = useState('0');

  const containsOnlySpecialCharacters = (text) => {
    const specialCharacterRegex = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    return specialCharacterRegex.test(text);
  };

  useEffect(() => {
    loadState();
    loadConversionRates();
  }, []);

  useEffect(() => {
    if (showOutput) {
      saveState();
      saveConversionRates();
    }
  }, [showOutput]);

  const loadState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('appState');
      if (savedState !== null) {
        const { input, output, fromCurrency, toCurrency } = JSON.parse(savedState);
        setInputText(input);
        setSavedInput(input);
        setSelectedFromCurrency(fromCurrency);
        setSelectedToCurrency(toCurrency);
        setSavedOutput(output);
        setShowOutput(true);
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
  };

  const saveState = async () => {
    try {
      const state = { input: inputText, output: savedOutput, fromCurrency: selectedFromCurrency, toCurrency: selectedToCurrency };
      await AsyncStorage.setItem('appState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  const loadConversionRates = async () => {
    try {
      const savedRates = await AsyncStorage.getItem('conversionRates');
      if (savedRates !== null) {
        setConversionRates(JSON.parse(savedRates));
      }
    } catch (error) {
      console.error('Error loading conversion rates:', error);
    }
  };

  const saveConversionRates = async () => {
    try {
      await AsyncStorage.setItem('conversionRates', JSON.stringify(conversionRates));
    } catch (error) {
      console.error('Error saving conversion rates:', error);
    }
  };

  const handleInputChange = (text) => {
    // Trim whitespace from the input
    const trimmedText = text.trim();
  
    // Check if input is empty after trimming whitespace
    if (trimmedText === '') {
      setInputText('');
      return;
    }
  
    // Check if input is a valid number
    const isValidNumber = !isNaN(parseFloat(trimmedText)) && isFinite(trimmedText);
  
    if (isValidNumber) {
      setInputText(trimmedText);
    } else {
    if (containsOnlySpecialCharacters(text)) {
      window.alert('Invalid Input - Special characters are not allowed.');
    setInputText('');
   
    }
    else{
      console.log("hellooooo")
      window.alert('Invalid Input Please enter a valid numeric value.');}
    }
  };
  
  

  const handleFromCurrencyChange = (value) => {
    setSelectedFromCurrency(value);
  };

  const handleToCurrencyChange = (value) => {
    setSelectedToCurrency(value);
  };

  const handleSubmit = () => {
    setShowOutput(true);
  };

  const handleClear = () => {
    setInputText('');
    setSelectedFromCurrency('default');
    setSelectedToCurrency('default');
    setShowOutput(false);
    setSavedInput('0');
    setSavedOutput('0');
    clearState();
  };

  const clearState = async () => {
    try {
      await AsyncStorage.removeItem('appState');
    } catch (error) {
      console.error('Error clearing state:', error);
    }
  };

  const handleReverse = () => {
    const tempFromCurrency = selectedFromCurrency;
    setSelectedFromCurrency(selectedToCurrency);
    setSelectedToCurrency(tempFromCurrency);
  };

  const convertedAmount = parseFloat(inputText) * conversionRates[`${selectedFromCurrency}_${selectedToCurrency}`];
  const sameCurrencyConversion = selectedFromCurrency === selectedToCurrency ? parseFloat(inputText) : convertedAmount;

  return (
    <View style={styles.boxContainer}>
    <Image source={require('./assets/logo.png')} style={{width: 120, height: 120}} />
    <br/>
    <h1>CURRENCY CONVERTOR</h1>
    <br/>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Picker
            style={styles.dropdown}
            selectedValue={selectedFromCurrency}
            onValueChange={handleFromCurrencyChange}
          >
            <Picker.Item label="Select" value="default" />
            <Picker.Item label="USD" value="USD" />
            <Picker.Item label="EUR" value="EUR" />
            <Picker.Item label="GBP" value="GBP" />
          </Picker>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={handleInputChange}
          />
        </View>
        <Button title=<Image source={require('./assets/reverse.png')} style={{width: 30, height: 30}} />
        onPress={handleReverse} color="transparent" >
        </Button>
        <View style={styles.inputContainer}>
          <Picker
            style={styles.dropdown}
            selectedValue={selectedToCurrency}
            onValueChange={handleToCurrencyChange}
          >
            <Picker.Item label="Select" value="default" />
            <Picker.Item label="USD" value="USD" />
            <Picker.Item label="EUR" value="EUR" />
            <Picker.Item label="GBP" value="GBP" />
          </Picker>
          {showOutput && (
            <TextInput
              style={styles.input}
              value={sameCurrencyConversion.toString()}
              editable={false}
            />
          )}
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Submit" onPress={handleSubmit} color="#007AFF" />
          <View style={{ marginHorizontal: 10 }} />
          <Button title="Clear" onPress={handleClear} color="#FF3B30" />
        </View>
        <Text style={styles.lastConversionText}>Last Conversion: {savedInput} {selectedFromCurrency} = {savedOutput} {selectedToCurrency}</Text>
        <StatusBar style="auto" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boxContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white', // Light gray background color for the box
  },
  container: {
    backgroundColor: '#E0E5EB', // Light blue background color
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
    borderRadius: 10, // Rounded edges for the box
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)', // Light gray border color for the box
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dropdown: {
    height: 50,
    width: 120, // Reduced width for the dropdown
    marginRight: 5, // Reduced space between label and arrow
    borderRadius: 10, // Rounded edges for the dropdown
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10, // Rounded edges for the text input
    flex: 1,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  lastConversionText: {
    marginTop: 20,
    fontSize: 16,
  },
});

export default App;
