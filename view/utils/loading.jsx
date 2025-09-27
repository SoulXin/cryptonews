import { View, Modal, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingModal = ({ visible }) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    </Modal>
  );
};

export default LoadingModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
