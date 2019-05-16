import React, { Component } from "react";
import {
  Text,
  View,
  ScrollView,
  FlatList,
  Modal,
  StyleSheet,
  Button,
  Alert,
  PanResponder
} from "react-native";
import { Card, Icon, Rating, Input } from "react-native-elements";
import { connect } from "react-redux";
import { baseUrl } from "../shared/baseUrl";
import { postFavorite } from "../redux/ActionCreators";
import { postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
  return {
    dishes: state.dishes,
    comments: state.comments,
    favorites: state.favorites
  };
};

const mapDispatchToProps = dispatch => ({
  postFavorite: (dishId) => dispatch(postFavorite(dishId)),
  postComment: (dishId, rating, comment, author, date) => 
    dispatch(postComment(dishId, rating, comment, author, date))
});

function RenderDish(props) {
  const dish = props.dish;

  const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
    if ( dx < -200 )
        return true;
    else
        return false;
};
const panResponder = PanResponder.create({
  onStartShouldSetPanResponder: (e, gestureState) => {
      return true;
  },
  onPanResponderEnd: (e, gestureState) => {
      console.log("pan responder end", gestureState);
      if (recognizeDrag(gestureState))
          Alert.alert(
              'Add  to Favorite?',
              'Are you sure you wish to add ' + dish.name + ' to favorite?',
              [
              {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
              {text: 'OK', onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}},
              ],
              { cancelable: false }
          );

      return true;
  }
})

  if (dish != null) {
    return (
      <Animatable.View animation="fadeInDown" duration={2000} delay={1000} {...panResponder.panHandlers}>
      <Card featuredTitle={dish.name} image={{ uri: baseUrl + dish.image }}>
        <Text style={{ margin: 10 }}>{dish.description}</Text>
        <View style={styles.formRow}>
          <Icon
            raised
            reverse
            name={props.favorite ? "heart" : "heart-o"}
            type="font-awesome"
            color="#f50"
            onPress={() =>
              props.favorite ? console.log("Already favorite") : props.onPress()
            }
          />
          <Icon
            raised
            reverse
            name="pencil"
            type="font-awesome"
            color="#512DA8"
            onPress={() => props.toggleModal()}
          />
        </View>
      </Card>
      </Animatable.View>
    );
  } else {
    return <View />;
  }
}

function RenderComments (props) {
  const comments = props.comments;

  const renderCommentItem = ({ item, index }) => {
    return (
      <View key={index} style={{ margin: 10 }}>
        <Text style={{ fontSize: 14 }}>{item.comment}</Text>
        <View style={styles.commentRating}>
          <Rating
            startingValue={parseInt(item.rating)}
            imageSize={15}
            style={styles.commentRating}
            readonly
          />
        </View>
        <Text style={{ fontSize: 12 }}>
          {`${item.author}, ${item.date}`}
        </Text>
      </View>
    );
  };

  return (
    <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
    <Card title="Comments">
      <FlatList
        data={comments}
        renderItem={renderCommentItem}
        keyExtractor={item => item.id.toString()}
      />
    </Card>
    </Animatable.View>
  );
};

class DishDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      author: "",
      comment: "",
      rating: 2
    };
  }

  toggleModal = () => {
    this.setState({ showModal: !this.state.showModal });
  };

  handleComment = (dishId) => () => {
    const date = new Date().toISOString();

    this.props.postComment(
      dishId,
      this.state.rating,
      this.state.comment,
      this.state.author,
      date
    );
    this.toggleModal();
  }

  handleRating = rating => {
    this.setState({ rating: rating });
  };
  resetForm = () => {
    this.setState({
      author: "",
      comment: ""
    });
  }

  markFavorite(dishId) {
    this.props.postFavorite(dishId);
  }

  static navigationOptions = {
    title: "Dish Details"
  };

  render() {
    const dishId = this.props.navigation.getParam("dishId", "");
    const comments = this.props.comments.comments.filter(
      (comment) => comment.dishId === dishId
    );
    return (
      <ScrollView>
        <RenderDish
          dish={this.props.dishes.dishes[+dishId]}
          favorite={this.props.favorites.some(el => el === dishId)}
          onPress={() => this.markFavorite(dishId)}
          toggleModal={() => this.toggleModal()}
        />
        <Modal
          style={styles.modal}
          animationType={"slide"}
          transparent={false}
          visible={this.state.showModal}
          onDismiss={ () => {this.toggleModal(); this.resetForm();}}
          onRequestClose={() => {this.toggleModal(); this.resetForm();}}
        >
          <View style={styles.formRow}>
            <Rating
              type="star"
              ratingCount={5}
              showRating = {true}
              minValue={1}
              onFinishRating={this.handleRating}
            />
            </View>
            <View style={styles.formRow}>
              <Input
                placeholder="Author"
                leftIcon={{
                  type: "font-awesome",
                  name: "user-o"
                }}
                leftIconContainerStyle={styles.icon}
                onChangeText={value => this.setState({ author: value })}
              />
              </View>
              <View style={styles.formRow}>
              <Input
                placeholder="Comment"
                leftIcon={{
                  type: "font-awesome",
                  name: "comment-o"
                }}
                leftIconContainerStyle={styles.icon}
                onChangeText={value => this.setState({ comment: value })}
              />
            </View>
            <View style={styles.formRow}>
              <Button
                onPress={
                  this.handleComment(dishId)
                }
                title="Submit"
                buttonStyle={{backgroundColor: '#512da8'}}
                containerStyle={styles.button}
              />
            </View>
            <View style={styles.formRow}>
              <Button
                onPress={() => {
                  this.toggleModal();
                  this.resetForm();
                }}
                title="Cancel"
                buttonStyle={{backgroundColor: '#808080'}}
                containerStyle={styles.button}
              />
            </View>
        </Modal>
        <RenderComments comments={comments} />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  formRow: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    margin: 20
  },
  modal: {
    justifyContent: "center",
    margin: 20
  },
  commentRating: {
    flexDirection: 'row',
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
}, 
icon: {
  marginRight: 15
},
button: {
  flex: 1
}
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DishDetail);
