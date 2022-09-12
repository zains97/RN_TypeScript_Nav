import {
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {getAllPosts, likePost, reportPost} from '../Api/postApis';
import {IPost} from '../Interfaces/PostInterfaces';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Paragraph,
  Text,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../Redux/store/store';
import {getUser} from '../Api/userApis';
import {getMe, storeMe} from '../Utilities/StoreMe';
import {updateMeState} from '../Redux/slices/MeSlice';
import {checkBlocked} from '../Utilities/checkBlocked';
import {useLinkBuilder} from '@react-navigation/native';

type Props = {
  navigation: any;
};
const {width} = Dimensions.get('screen');

const MainFeed = ({navigation}: Props) => {
  //Component start
  const dispatch = useDispatch();
  const me = useSelector((state: RootState) => state.me.value);
  const LeftContent = (image: any, userId: string) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('OtherProfile', {userId}); //Add props for navigation UserID
      }}>
      <Avatar.Image size={40} source={{uri: image}} />
    </TouchableOpacity>
  );
  // const updateUser = () => {
  //   console.log('ME STATE REDUX: ', me._id);

  //   try {
  //     getUser(me._id).then(res => {
  //       console.log('MAIN FEED RES: ', res);
  //       storeMe(res);
  //       dispatch(updateMeState(res));
  //     });
  //   } catch (error: any) {
  //     setLoading(true);
  //     Alert.alert(error);
  //   }
  // };

  const defaultPosts: IPost[] = [];

  const [posts, setPosts]: [IPost[], (posts: IPost[]) => void] =
    React.useState(defaultPosts);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState('');
  const image = true;

  // React.useEffect(() => {
  //   // getMe().then(res => console.log('GETME RES MAIN FEED : ', res));
  //   updateUser();
  // }, []);

  React.useEffect(() => {
    getAllPosts()
      .then(response => {
        setPosts(response);
        setLoading(false);
      })
      .catch(ex => {
        const error =
          ex.response.status === 404
            ? 'Resource Not found'
            : 'An unexpected error has occurred';
        setError(error);
        setLoading(false);
      });
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color="#1d4ed8" />
      ) : (
        <FlatList
          style={{margin: 20}}
          data={posts}
          renderItem={({item}) =>
            !checkBlocked(item.creator, me.blockedUsers) ? (
              <Card style={{marginVertical: 5}}>
                <Card.Title
                  title={item.creatorName}
                  subtitle={item.createDate.toString()}
                  left={() => LeftContent(item.creatorImage, item.creator)}
                  titleStyle={{fontSize: 16}}
                />

                {item.postImage == undefined ||
                item.postImage == 'no' ? null : (
                  <Card.Cover
                    resizeMethod="resize"
                    resizeMode="cover"
                    source={{uri: `data:image/jpeg;base64,${item.postImage}`}}
                  />
                )}
                <Card.Content>
                  <Paragraph>{item.postBody}</Paragraph>
                </Card.Content>

                <Card.Actions>
                  <Button
                    onPress={() => {
                      likePost(me._id, item._id, item);
                    }}>
                    <MaterialCommunityIcons
                      name="thumb-up-outline"
                      color="#1d4ed8"
                      size={22}
                    />
                  </Button>
                  <Text style={{color: 'blue'}}>
                    {item.likeCount == undefined ? 0 : item.likeCount}
                  </Text>
                  <Button
                    onPress={() => {
                      navigation.navigate('ViewPost');
                    }}
                    color="#1d4ed8">
                    Comments
                  </Button>
                  <Button
                    onPress={() => {
                      reportPost(me._id, item._id);
                      console.log('Report');
                    }}
                    color="white"
                    style={{
                      backgroundColor: 'red',
                      marginHorizontal: '5%',
                    }}>
                    Report
                  </Button>
                </Card.Actions>
              </Card>
            ) : (
              <></>
            )
          }
        />
      )}
    </View>
  );
};

export default MainFeed;

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignContent: 'center'},
});
