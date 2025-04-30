import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { likePost, unlikePost, isPostLiked } from '../../config/likes';

const LikeButton = ({ postId, userId }) => {
  const [liked, setLiked] = useState(false);
  const [scale] = useState(new Animated.Value(1));

  useEffect(() => {
    const checkLikeStatus = async () => {
      const status = await isPostLiked(postId, userId);
      setLiked(status);
    };
    checkLikeStatus();
  }, []);

  const handleLike = async () => {
    if (liked) await unlikePost(postId, userId);
    else await likePost(postId, userId);
    setLiked(!liked);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.5, duration: 150, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true })
    ]).start();
  };

  return (
    <TouchableOpacity onPress={handleLike}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name={liked ? 'heart' : 'heart-outline'} size={24} color={liked ? 'red' : 'gray'} />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default LikeButton;