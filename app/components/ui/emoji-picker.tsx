'use client';

import { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';

// Emoji data with keywords for search
const EMOJI_DATA: Array<{ emoji: string; keywords: string[] }> = [
  // Faces
  { emoji: '😀', keywords: ['grinning', 'face', 'smile', 'happy', 'joy'] },
  { emoji: '😃', keywords: ['grinning', 'eyes', 'face', 'happy', 'joy', 'smile'] },
  { emoji: '😄', keywords: ['grinning', 'smiling', 'eyes', 'face', 'happy', 'joy'] },
  { emoji: '😁', keywords: ['beaming', 'face', 'smile', 'happy', 'joy'] },
  { emoji: '😆', keywords: ['grinning', 'squinting', 'face', 'happy', 'joy', 'laugh'] },
  { emoji: '😅', keywords: ['grinning', 'sweat', 'face', 'happy', 'relief'] },
  { emoji: '🤣', keywords: ['rolling', 'floor', 'laughing', 'laugh', 'funny'] },
  { emoji: '😂', keywords: ['face', 'tears', 'joy', 'laugh', 'crying', 'happy'] },
  { emoji: '🙂', keywords: ['slightly', 'smiling', 'face', 'smile', 'happy'] },
  { emoji: '🙃', keywords: ['upside', 'down', 'face', 'silly', 'funny'] },
  { emoji: '😉', keywords: ['winking', 'face', 'wink', 'flirt', 'playful'] },
  { emoji: '😊', keywords: ['smiling', 'eyes', 'face', 'happy', 'blush'] },
  { emoji: '😇', keywords: ['smiling', 'face', 'halo', 'angel', 'innocent'] },
  { emoji: '🥰', keywords: ['smiling', 'face', 'hearts', 'love', 'happy'] },
  { emoji: '😍', keywords: ['smiling', 'heart', 'eyes', 'face', 'love', 'adore'] },
  { emoji: '🤩', keywords: ['star', 'struck', 'face', 'excited', 'amazed'] },
  { emoji: '😘', keywords: ['face', 'blowing', 'kiss', 'love', 'romance'] },
  { emoji: '😗', keywords: ['kissing', 'face', 'kiss', 'love'] },
  { emoji: '😚', keywords: ['kissing', 'face', 'closed', 'eyes', 'kiss', 'love'] },
  { emoji: '😙', keywords: ['kissing', 'face', 'smiling', 'eyes', 'kiss'] },
  { emoji: '😋', keywords: ['face', 'savoring', 'food', 'yummy', 'delicious'] },
  { emoji: '😛', keywords: ['face', 'tongue', 'silly', 'playful'] },
  { emoji: '😜', keywords: ['winking', 'face', 'tongue', 'silly', 'funny'] },
  { emoji: '🤪', keywords: ['zany', 'face', 'crazy', 'silly', 'funny'] },
  { emoji: '😝', keywords: ['squinting', 'face', 'tongue', 'silly', 'funny'] },
  { emoji: '🤑', keywords: ['money', 'mouth', 'face', 'rich', 'greedy'] },
  { emoji: '🤗', keywords: ['hugging', 'face', 'hug', 'love', 'comfort'] },
  { emoji: '🤭', keywords: ['face', 'hand', 'over', 'mouth', 'secret', 'shush'] },
  { emoji: '🤫', keywords: ['shushing', 'face', 'quiet', 'secret', 'shush'] },
  { emoji: '🤔', keywords: ['thinking', 'face', 'think', 'ponder', 'consider'] },
  { emoji: '🤐', keywords: ['zipper', 'mouth', 'face', 'quiet', 'secret'] },
  { emoji: '🤨', keywords: ['face', 'raised', 'eyebrow', 'skeptical', 'doubt'] },
  { emoji: '😐', keywords: ['neutral', 'face', 'neutral', 'expressionless'] },
  { emoji: '😑', keywords: ['expressionless', 'face', 'neutral', 'blank'] },
  { emoji: '😶', keywords: ['face', 'without', 'mouth', 'speechless', 'quiet'] },
  { emoji: '😏', keywords: ['smirking', 'face', 'smirk', 'sly', 'cunning'] },
  { emoji: '😒', keywords: ['unamused', 'face', 'unhappy', 'bored'] },
  { emoji: '🙄', keywords: ['face', 'rolling', 'eyes', 'sarcastic', 'annoyed'] },
  { emoji: '😬', keywords: ['grimacing', 'face', 'grimace', 'uncomfortable'] },
  { emoji: '🤥', keywords: ['lying', 'face', 'lie', 'dishonest'] },
  { emoji: '😌', keywords: ['relieved', 'face', 'relief', 'peaceful'] },
  { emoji: '😔', keywords: ['pensive', 'face', 'sad', 'thoughtful'] },
  { emoji: '😪', keywords: ['sleepy', 'face', 'tired', 'sleepy'] },
  { emoji: '🤤', keywords: ['drooling', 'face', 'drool', 'hungry'] },
  { emoji: '😴', keywords: ['sleeping', 'face', 'sleep', 'tired', 'zzz'] },
  { emoji: '😷', keywords: ['face', 'medical', 'mask', 'sick', 'ill'] },
  { emoji: '🤒', keywords: ['face', 'thermometer', 'sick', 'fever', 'ill'] },
  { emoji: '🤕', keywords: ['face', 'bandage', 'injured', 'hurt', 'sick'] },
  { emoji: '🤢', keywords: ['nauseated', 'face', 'sick', 'vomit', 'ill'] },
  { emoji: '🤮', keywords: ['face', 'vomiting', 'sick', 'vomit', 'ill'] },
  { emoji: '🤧', keywords: ['sneezing', 'face', 'sneeze', 'sick', 'allergy'] },
  { emoji: '🥵', keywords: ['hot', 'face', 'hot', 'sweat', 'fever'] },
  { emoji: '🥶', keywords: ['cold', 'face', 'cold', 'freeze', 'frozen'] },
  { emoji: '😵', keywords: ['dizzy', 'face', 'dizzy', 'confused', 'spinning'] },
  { emoji: '🤯', keywords: ['exploding', 'head', 'mind', 'blown', 'amazed'] },
  { emoji: '🤠', keywords: ['cowboy', 'hat', 'face', 'cowboy', 'western'] },
  { emoji: '🥳', keywords: ['partying', 'face', 'party', 'celebration', 'happy'] },
  { emoji: '😎', keywords: ['smiling', 'face', 'sunglasses', 'cool', 'awesome'] },
  { emoji: '🤓', keywords: ['nerd', 'face', 'nerd', 'geek', 'smart'] },
  { emoji: '🧐', keywords: ['face', 'monocle', 'investigating', 'detective'] },
  { emoji: '😕', keywords: ['confused', 'face', 'confused', 'unsure'] },
  { emoji: '😟', keywords: ['worried', 'face', 'worried', 'anxious'] },
  { emoji: '🙁', keywords: ['slightly', 'frowning', 'face', 'sad', 'unhappy'] },
  { emoji: '😮', keywords: ['face', 'open', 'mouth', 'surprised', 'shocked'] },
  { emoji: '😯', keywords: ['hushed', 'face', 'surprised', 'shocked'] },
  { emoji: '😲', keywords: ['astonished', 'face', 'surprised', 'shocked'] },
  { emoji: '😳', keywords: ['flushed', 'face', 'embarrassed', 'blush'] },
  { emoji: '🥺', keywords: ['pleading', 'face', 'sad', 'cute', 'puppy'] },
  { emoji: '😦', keywords: ['frowning', 'face', 'open', 'mouth', 'sad'] },
  { emoji: '😧', keywords: ['anguished', 'face', 'sad', 'distressed'] },
  { emoji: '😨', keywords: ['fearful', 'face', 'scared', 'afraid', 'fear'] },
  { emoji: '😰', keywords: ['anxious', 'face', 'sweat', 'worried', 'nervous'] },
  { emoji: '😥', keywords: ['sad', 'relieved', 'face', 'disappointed', 'relief'] },
  { emoji: '😢', keywords: ['crying', 'face', 'sad', 'tears', 'cry'] },
  { emoji: '😭', keywords: ['loudly', 'crying', 'face', 'sad', 'tears', 'sob'] },
  { emoji: '😱', keywords: ['face', 'screaming', 'fear', 'scared', 'shocked'] },
  { emoji: '😖', keywords: ['confounded', 'face', 'confused', 'frustrated'] },
  { emoji: '😣', keywords: ['persevering', 'face', 'struggling', 'tired'] },
  { emoji: '😞', keywords: ['disappointed', 'face', 'sad', 'disappointed'] },
  { emoji: '😓', keywords: ['downcast', 'face', 'sweat', 'tired', 'exhausted'] },
  { emoji: '😩', keywords: ['weary', 'face', 'tired', 'exhausted'] },
  { emoji: '😫', keywords: ['tired', 'face', 'tired', 'exhausted', 'sleepy'] },
  { emoji: '🥱', keywords: ['yawning', 'face', 'tired', 'sleepy', 'yawn'] },
  { emoji: '😤', keywords: ['face', 'steam', 'nose', 'angry', 'proud'] },
  { emoji: '😡', keywords: ['pouting', 'face', 'angry', 'mad', 'furious'] },
  { emoji: '😠', keywords: ['angry', 'face', 'angry', 'mad', 'annoyed'] },
  { emoji: '🤬', keywords: ['face', 'symbols', 'mouth', 'swearing', 'curse'] },
  { emoji: '😈', keywords: ['smiling', 'face', 'horns', 'devil', 'evil', 'devil'] },
  { emoji: '👿', keywords: ['angry', 'face', 'horns', 'devil', 'evil', 'angry'] },
  { emoji: '💀', keywords: ['skull', 'death', 'dead', 'skeleton'] },
  { emoji: '☠️', keywords: ['skull', 'crossbones', 'death', 'pirate', 'danger'] },
  { emoji: '💩', keywords: ['pile', 'poo', 'poop', 'shit', 'crap'] },
  { emoji: '🤡', keywords: ['clown', 'face', 'clown', 'funny', 'silly'] },
  { emoji: '👹', keywords: ['ogre', 'monster', 'demon', 'japanese'] },
  { emoji: '👺', keywords: ['goblin', 'monster', 'demon', 'japanese'] },
  { emoji: '👻', keywords: ['ghost', 'spooky', 'scary', 'halloween'] },
  { emoji: '👽', keywords: ['alien', 'space', 'ufo', 'extraterrestrial'] },
  { emoji: '👾', keywords: ['alien', 'monster', 'game', 'arcade', 'retro'] },
  { emoji: '🤖', keywords: ['robot', 'machine', 'tech', 'ai', 'android'] },
  { emoji: '😺', keywords: ['grinning', 'cat', 'face', 'cat', 'happy'] },
  { emoji: '😸', keywords: ['grinning', 'cat', 'eyes', 'face', 'cat', 'happy'] },
  { emoji: '😹', keywords: ['cat', 'tears', 'joy', 'face', 'cat', 'laugh'] },
  { emoji: '😻', keywords: ['heart', 'eyes', 'cat', 'face', 'cat', 'love'] },
  { emoji: '😼', keywords: ['winking', 'cat', 'face', 'cat', 'wink'] },
  { emoji: '😽', keywords: ['kissing', 'cat', 'face', 'cat', 'kiss'] },
  { emoji: '🙀', keywords: ['weary', 'cat', 'face', 'cat', 'scared'] },
  { emoji: '😿', keywords: ['crying', 'cat', 'face', 'cat', 'sad', 'tears'] },
  { emoji: '😾', keywords: ['pouting', 'cat', 'face', 'cat', 'angry'] },
  
  // Food & Drinks
  { emoji: '🍔', keywords: ['hamburger', 'burger', 'food', 'fast', 'food'] },
  { emoji: '🍕', keywords: ['pizza', 'slice', 'food', 'italian'] },
  { emoji: '🍖', keywords: ['meat', 'bone', 'food', 'meat'] },
  { emoji: '🍗', keywords: ['poultry', 'leg', 'chicken', 'food', 'meat'] },
  { emoji: '🍘', keywords: ['rice', 'cracker', 'food', 'japanese', 'snack'] },
  { emoji: '🍙', keywords: ['rice', 'ball', 'food', 'japanese', 'onigiri'] },
  { emoji: '🍚', keywords: ['cooked', 'rice', 'food', 'japanese'] },
  { emoji: '🍛', keywords: ['curry', 'rice', 'food', 'indian', 'spicy'] },
  { emoji: '🍜', keywords: ['steaming', 'bowl', 'noodles', 'ramen', 'food'] },
  { emoji: '🍝', keywords: ['spaghetti', 'pasta', 'food', 'italian'] },
  { emoji: '🍞', keywords: ['bread', 'food', 'bakery'] },
  { emoji: '🍟', keywords: ['french', 'fries', 'food', 'fast', 'food'] },
  { emoji: '🍠', keywords: ['roasted', 'sweet', 'potato', 'food'] },
  { emoji: '🍡', keywords: ['dango', 'food', 'japanese', 'dessert'] },
  { emoji: '🍢', keywords: ['oden', 'food', 'japanese'] },
  { emoji: '🍣', keywords: ['sushi', 'food', 'japanese'] },
  { emoji: '🍤', keywords: ['fried', 'shrimp', 'food', 'seafood'] },
  { emoji: '🍥', keywords: ['fish', 'cake', 'swirl', 'food', 'japanese'] },
  { emoji: '🥮', keywords: ['moon', 'cake', 'food', 'chinese', 'dessert'] },
  { emoji: '🍦', keywords: ['soft', 'ice', 'cream', 'dessert', 'sweet'] },
  { emoji: '🍧', keywords: ['shaved', 'ice', 'dessert', 'snow', 'cone'] },
  { emoji: '🍨', keywords: ['ice', 'cream', 'dessert', 'sweet'] },
  { emoji: '🍩', keywords: ['doughnut', 'donut', 'dessert', 'sweet'] },
  { emoji: '🍪', keywords: ['cookie', 'dessert', 'sweet', 'snack'] },
  { emoji: '🎂', keywords: ['birthday', 'cake', 'dessert', 'celebration'] },
  { emoji: '🍰', keywords: ['shortcake', 'cake', 'dessert', 'sweet'] },
  { emoji: '🧁', keywords: ['cupcake', 'dessert', 'sweet', 'cake'] },
  { emoji: '🍫', keywords: ['chocolate', 'bar', 'dessert', 'sweet', 'candy'] },
  { emoji: '🍬', keywords: ['candy', 'dessert', 'sweet'] },
  { emoji: '🍭', keywords: ['lollipop', 'candy', 'dessert', 'sweet'] },
  { emoji: '🍮', keywords: ['custard', 'dessert', 'sweet', 'pudding'] },
  { emoji: '🍯', keywords: ['honey', 'pot', 'sweet', 'food'] },
  { emoji: '🍼', keywords: ['baby', 'bottle', 'milk', 'baby'] },
  { emoji: '🥛', keywords: ['glass', 'milk', 'drink', 'dairy'] },
  { emoji: '☕', keywords: ['hot', 'beverage', 'coffee', 'tea', 'drink'] },
  { emoji: '🍵', keywords: ['teacup', 'without', 'handle', 'tea', 'drink'] },
  { emoji: '🍶', keywords: ['sake', 'bottle', 'cup', 'drink', 'japanese'] },
  { emoji: '🍾', keywords: ['bottle', 'popping', 'cork', 'champagne', 'celebration'] },
  { emoji: '🍷', keywords: ['wine', 'glass', 'drink', 'alcohol'] },
  { emoji: '🍸', keywords: ['cocktail', 'glass', 'drink', 'alcohol'] },
  { emoji: '🍹', keywords: ['tropical', 'drink', 'cocktail', 'alcohol'] },
  { emoji: '🍺', keywords: ['beer', 'mug', 'drink', 'alcohol'] },
  { emoji: '🍻', keywords: ['clinking', 'beer', 'mugs', 'cheers', 'celebration'] },
  { emoji: '🥂', keywords: ['clinking', 'glasses', 'cheers', 'celebration'] },
  { emoji: '🥃', keywords: ['tumbler', 'glass', 'whiskey', 'drink', 'alcohol'] },
  { emoji: '🥤', keywords: ['cup', 'straw', 'drink', 'soda'] },
  { emoji: '🧃', keywords: ['beverage', 'box', 'juice', 'drink'] },
  { emoji: '🧉', keywords: ['mate', 'drink', 'tea'] },
  { emoji: '🧊', keywords: ['ice', 'cube', 'cold', 'frozen'] },
  { emoji: '🥢', keywords: ['chopsticks', 'utensils', 'japanese', 'chinese'] },
  { emoji: '🍽️', keywords: ['fork', 'knife', 'plate', 'dining', 'food'] },
  { emoji: '🍴', keywords: ['fork', 'knife', 'utensils', 'dining'] },
  { emoji: '🥄', keywords: ['spoon', 'utensil', 'dining'] },
  { emoji: '🔪', keywords: ['kitchen', 'knife', 'cooking', 'cut'] },
  { emoji: '🏺', keywords: ['amphora', 'vase', 'ancient', 'greek'] },
  
  // Activities
  { emoji: '⚽', keywords: ['soccer', 'ball', 'football', 'sport'] },
  { emoji: '🏀', keywords: ['basketball', 'sport', 'ball'] },
  { emoji: '🏈', keywords: ['american', 'football', 'sport'] },
  { emoji: '⚾', keywords: ['baseball', 'sport', 'ball'] },
  { emoji: '🥎', keywords: ['softball', 'sport', 'ball'] },
  { emoji: '🎾', keywords: ['tennis', 'sport', 'ball'] },
  { emoji: '🏐', keywords: ['volleyball', 'sport', 'ball'] },
  { emoji: '🏉', keywords: ['rugby', 'football', 'sport'] },
  { emoji: '🥏', keywords: ['flying', 'disc', 'frisbee', 'sport'] },
  { emoji: '🎱', keywords: ['pool', 'ball', '8', 'billiards', 'game'] },
  { emoji: '🏓', keywords: ['ping', 'pong', 'table', 'tennis', 'sport'] },
  { emoji: '🏸', keywords: ['badminton', 'sport', 'racket'] },
  { emoji: '🥅', keywords: ['goal', 'net', 'sport', 'soccer'] },
  { emoji: '🏒', keywords: ['ice', 'hockey', 'stick', 'puck', 'sport'] },
  { emoji: '🏑', keywords: ['field', 'hockey', 'sport'] },
  { emoji: '🏏', keywords: ['cricket', 'game', 'sport'] },
  { emoji: '🥍', keywords: ['lacrosse', 'sport'] },
  { emoji: '🏹', keywords: ['bow', 'arrow', 'archery', 'sport'] },
  { emoji: '🎣', keywords: ['fishing', 'pole', 'fish', 'sport'] },
  { emoji: '🥊', keywords: ['boxing', 'glove', 'sport', 'fight'] },
  { emoji: '🥋', keywords: ['martial', 'arts', 'uniform', 'karate'] },
  { emoji: '🎽', keywords: ['running', 'shirt', 'sport', 'marathon'] },
  { emoji: '🛹', keywords: ['skateboard', 'sport', 'skate'] },
  { emoji: '🛷', keywords: ['sled', 'sleigh', 'snow', 'winter'] },
  { emoji: '⛷️', keywords: ['skier', 'skiing', 'sport', 'snow', 'winter'] },
  { emoji: '🏂', keywords: ['snowboarder', 'snowboarding', 'sport', 'snow'] },
  { emoji: '🏋️', keywords: ['person', 'lifting', 'weights', 'gym', 'exercise'] },
  { emoji: '🤼', keywords: ['people', 'wrestling', 'sport', 'fight'] },
  { emoji: '🤸', keywords: ['person', 'cartwheeling', 'gymnastics', 'sport'] },
  { emoji: '🤺', keywords: ['person', 'fencing', 'sport', 'sword'] },
  { emoji: '⛹️', keywords: ['person', 'bouncing', 'ball', 'basketball', 'sport'] },
  { emoji: '🤾', keywords: ['person', 'playing', 'handball', 'sport'] },
  { emoji: '🏌️', keywords: ['person', 'golfing', 'golf', 'sport'] },
  { emoji: '🏇', keywords: ['horse', 'racing', 'sport', 'horse'] },
  { emoji: '🧘', keywords: ['person', 'lotus', 'position', 'yoga', 'meditation'] },
  { emoji: '🏄', keywords: ['person', 'surfing', 'surf', 'sport', 'ocean'] },
  { emoji: '🏊', keywords: ['person', 'swimming', 'swim', 'sport', 'water'] },
  { emoji: '🤽', keywords: ['person', 'playing', 'water', 'polo', 'sport'] },
  { emoji: '🚣', keywords: ['person', 'rowing', 'boat', 'sport', 'water'] },
  { emoji: '🧗', keywords: ['person', 'climbing', 'rock', 'climbing', 'sport'] },
  { emoji: '🚵', keywords: ['person', 'mountain', 'biking', 'bike', 'sport'] },
  { emoji: '🚴', keywords: ['person', 'biking', 'bike', 'sport', 'cycling'] },
  { emoji: '🏆', keywords: ['trophy', 'award', 'winner', 'champion'] },
  { emoji: '🥇', keywords: ['1st', 'place', 'medal', 'gold', 'winner'] },
  { emoji: '🥈', keywords: ['2nd', 'place', 'medal', 'silver', 'second'] },
  { emoji: '🥉', keywords: ['3rd', 'place', 'medal', 'bronze', 'third'] },
  { emoji: '🏅', keywords: ['sports', 'medal', 'award'] },
  { emoji: '🎖️', keywords: ['military', 'medal', 'award'] },
  { emoji: '🏵️', keywords: ['rosette', 'award', 'ribbon'] },
  { emoji: '🎗️', keywords: ['reminder', 'ribbon', 'awareness'] },
  { emoji: '🎫', keywords: ['ticket', 'entrance', 'admission'] },
  { emoji: '🎟️', keywords: ['admission', 'tickets', 'entrance'] },
  { emoji: '🎪', keywords: ['circus', 'tent', 'entertainment'] },
  { emoji: '🤹', keywords: ['person', 'juggling', 'entertainment', 'circus'] },
  { emoji: '🎭', keywords: ['performing', 'arts', 'theater', 'drama'] },
  { emoji: '🩰', keywords: ['ballet', 'shoes', 'dance', 'ballet'] },
  { emoji: '🎨', keywords: ['artist', 'palette', 'art', 'paint', 'color'] },
  { emoji: '🎬', keywords: ['clapper', 'board', 'movie', 'film', 'cinema'] },
  { emoji: '🎤', keywords: ['microphone', 'music', 'sing', 'karaoke'] },
  { emoji: '🎧', keywords: ['headphone', 'music', 'listen', 'audio'] },
  { emoji: '🎼', keywords: ['musical', 'score', 'music', 'notes'] },
  { emoji: '🎹', keywords: ['musical', 'keyboard', 'piano', 'music'] },
  { emoji: '🥁', keywords: ['drum', 'music', 'beat'] },
  { emoji: '🎷', keywords: ['saxophone', 'music', 'instrument', 'jazz'] },
  { emoji: '🎺', keywords: ['trumpet', 'music', 'instrument', 'brass'] },
  { emoji: '🎸', keywords: ['guitar', 'music', 'instrument', 'rock'] },
  { emoji: '🪕', keywords: ['banjo', 'music', 'instrument'] },
  { emoji: '🎻', keywords: ['violin', 'music', 'instrument', 'classical'] },
  { emoji: '🎲', keywords: ['game', 'die', 'dice', 'gamble', 'random'] },
  { emoji: '♟️', keywords: ['chess', 'pawn', 'game', 'chess'] },
  { emoji: '🎯', keywords: ['direct', 'hit', 'target', 'dart', 'game'] },
  { emoji: '🎳', keywords: ['bowling', 'game', 'sport'] },
  { emoji: '🎮', keywords: ['video', 'game', 'controller', 'gaming', 'play'] },
  { emoji: '🎰', keywords: ['slot', 'machine', 'casino', 'gamble'] },
  { emoji: '🧩', keywords: ['puzzle', 'piece', 'jigsaw', 'game'] },
  
  // Objects
  { emoji: '📱', keywords: ['mobile', 'phone', 'smartphone', 'iphone', 'android'] },
  { emoji: '💻', keywords: ['laptop', 'computer', 'macbook', 'pc'] },
  { emoji: '⌨️', keywords: ['keyboard', 'computer', 'typing', 'input'] },
  { emoji: '🖥️', keywords: ['desktop', 'computer', 'monitor', 'pc'] },
  { emoji: '🖨️', keywords: ['printer', 'print', 'office'] },
  { emoji: '🖱️', keywords: ['computer', 'mouse', 'click', 'pointer'] },
  { emoji: '🖲️', keywords: ['trackball', 'computer', 'mouse'] },
  { emoji: '🕹️', keywords: ['joystick', 'game', 'controller', 'arcade'] },
  { emoji: '🗜️', keywords: ['clamp', 'compression', 'tool'] },
  { emoji: '💾', keywords: ['floppy', 'disk', 'save', 'storage', 'old'] },
  { emoji: '💿', keywords: ['optical', 'disk', 'cd', 'dvd', 'storage'] },
  { emoji: '📀', keywords: ['dvd', 'disk', 'movie', 'storage'] },
  { emoji: '📼', keywords: ['videocassette', 'tape', 'video', 'old'] },
  { emoji: '📷', keywords: ['camera', 'photo', 'photography'] },
  { emoji: '📸', keywords: ['camera', 'flash', 'photo', 'photography'] },
  { emoji: '📹', keywords: ['video', 'camera', 'video', 'recording'] },
  { emoji: '🎥', keywords: ['movie', 'camera', 'film', 'cinema'] },
  { emoji: '📽️', keywords: ['film', 'projector', 'movie', 'cinema'] },
  { emoji: '🎞️', keywords: ['film', 'frames', 'movie', 'cinema'] },
  { emoji: '📞', keywords: ['telephone', 'receiver', 'phone', 'call'] },
  { emoji: '☎️', keywords: ['telephone', 'phone', 'call'] },
  { emoji: '📟', keywords: ['pager', 'beeper', 'old', 'communication'] },
  { emoji: '📠', keywords: ['fax', 'machine', 'office', 'document'] },
  { emoji: '📺', keywords: ['television', 'tv', 'watch', 'entertainment'] },
  { emoji: '📻', keywords: ['radio', 'listen', 'music', 'news'] },
  { emoji: '🎙️', keywords: ['studio', 'microphone', 'recording', 'podcast'] },
  { emoji: '🎚️', keywords: ['level', 'slider', 'audio', 'control'] },
  { emoji: '🎛️', keywords: ['control', 'knobs', 'audio', 'mixing'] },
  { emoji: '⏱️', keywords: ['stopwatch', 'time', 'timer', 'sport'] },
  { emoji: '⏲️', keywords: ['timer', 'clock', 'time', 'alarm'] },
  { emoji: '⏰', keywords: ['alarm', 'clock', 'time', 'wake', 'up'] },
  { emoji: '🕰️', keywords: ['mantelpiece', 'clock', 'time', 'vintage'] },
  { emoji: '⌛', keywords: ['hourglass', 'done', 'time', 'sand'] },
  { emoji: '⏳', keywords: ['hourglass', 'not', 'done', 'time', 'waiting'] },
  { emoji: '📡', keywords: ['satellite', 'antenna', 'signal', 'communication'] },
  { emoji: '🔋', keywords: ['battery', 'power', 'energy', 'charge'] },
  { emoji: '🔌', keywords: ['electric', 'plug', 'power', 'charge'] },
  { emoji: '💡', keywords: ['light', 'bulb', 'idea', 'bright', 'light'] },
  { emoji: '🔦', keywords: ['flashlight', 'torch', 'light', 'dark'] },
  { emoji: '🕯️', keywords: ['candle', 'light', 'flame', 'wax'] },
  { emoji: '🧯', keywords: ['fire', 'extinguisher', 'fire', 'safety'] },
  { emoji: '🛢️', keywords: ['oil', 'drum', 'fuel', 'gas'] },
  { emoji: '💸', keywords: ['money', 'wings', 'flying', 'money', 'expensive'] },
  { emoji: '💵', keywords: ['dollar', 'banknote', 'money', 'usd'] },
  { emoji: '💴', keywords: ['yen', 'banknote', 'money', 'japanese'] },
  { emoji: '💶', keywords: ['euro', 'banknote', 'money', 'eur'] },
  { emoji: '💷', keywords: ['pound', 'banknote', 'money', 'gbp'] },
  { emoji: '💰', keywords: ['money', 'bag', 'dollar', 'rich', 'wealth'] },
  { emoji: '💳', keywords: ['credit', 'card', 'payment', 'bank'] },
  { emoji: '💎', keywords: ['gem', 'stone', 'diamond', 'jewelry', 'precious'] },
  { emoji: '⚖️', keywords: ['balance', 'scale', 'justice', 'law', 'court'] },
  { emoji: '🧰', keywords: ['toolbox', 'tools', 'repair', 'fix'] },
  { emoji: '🧲', keywords: ['magnet', 'attraction', 'magnetic', 'pull'] },
  { emoji: '🪓', keywords: ['axe', 'tool', 'chop', 'wood'] },
  { emoji: '🛠️', keywords: ['hammer', 'wrench', 'tools', 'repair'] },
  { emoji: '🪚', keywords: ['carpentry', 'saw', 'tool', 'cut'] },
  { emoji: '🔧', keywords: ['wrench', 'tool', 'repair', 'fix'] },
  { emoji: '🔨', keywords: ['hammer', 'tool', 'build', 'construction'] },
  { emoji: '⚒️', keywords: ['hammer', 'pick', 'tools', 'mining'] },
  { emoji: '⚙️', keywords: ['gear', 'settings', 'mechanical', 'cog'] },
  { emoji: '🪛', keywords: ['screwdriver', 'tool', 'screw', 'repair'] },
  { emoji: '🔩', keywords: ['nut', 'bolt', 'screw', 'hardware'] },
  { emoji: '⚡', keywords: ['high', 'voltage', 'lightning', 'electric', 'power'] },
  { emoji: '🔥', keywords: ['fire', 'flame', 'hot', 'burn'] },
  { emoji: '💧', keywords: ['droplet', 'water', 'rain', 'liquid'] },
  { emoji: '🌊', keywords: ['water', 'wave', 'ocean', 'sea', 'beach'] },
  
  // Symbols
  { emoji: '❤️', keywords: ['red', 'heart', 'love', 'like', 'favorite'] },
  { emoji: '🧡', keywords: ['orange', 'heart', 'love'] },
  { emoji: '💛', keywords: ['yellow', 'heart', 'love', 'friendship'] },
  { emoji: '💚', keywords: ['green', 'heart', 'love', 'nature'] },
  { emoji: '💙', keywords: ['blue', 'heart', 'love', 'trust'] },
  { emoji: '💜', keywords: ['purple', 'heart', 'love'] },
  { emoji: '🖤', keywords: ['black', 'heart', 'love', 'dark'] },
  { emoji: '🤍', keywords: ['white', 'heart', 'love', 'pure'] },
  { emoji: '🤎', keywords: ['brown', 'heart', 'love'] },
  { emoji: '💔', keywords: ['broken', 'heart', 'sad', 'breakup', 'heartbreak'] },
  { emoji: '❣️', keywords: ['heart', 'exclamation', 'love', 'emphasis'] },
  { emoji: '💕', keywords: ['two', 'hearts', 'love', 'romance'] },
  { emoji: '💞', keywords: ['revolving', 'hearts', 'love', 'romance'] },
  { emoji: '💓', keywords: ['beating', 'heart', 'love', 'pulse'] },
  { emoji: '💗', keywords: ['growing', 'heart', 'love', 'grow'] },
  { emoji: '💖', keywords: ['sparkling', 'heart', 'love', 'sparkle'] },
  { emoji: '💘', keywords: ['heart', 'arrow', 'cupid', 'love', 'romance'] },
  { emoji: '💝', keywords: ['heart', 'ribbon', 'gift', 'love', 'present'] },
  { emoji: '💟', keywords: ['heart', 'decoration', 'love'] },
  { emoji: '☮️', keywords: ['peace', 'symbol', 'peace', 'peaceful'] },
  { emoji: '✝️', keywords: ['latin', 'cross', 'christian', 'religion'] },
  { emoji: '☪️', keywords: ['star', 'crescent', 'islam', 'muslim', 'religion'] },
  { emoji: '🕉️', keywords: ['om', 'hindu', 'religion', 'spiritual'] },
  { emoji: '☸️', keywords: ['wheel', 'dharma', 'buddhism', 'religion'] },
  { emoji: '✡️', keywords: ['star', 'david', 'jewish', 'judaism', 'religion'] },
  { emoji: '🔯', keywords: ['dotted', 'six', 'pointed', 'star', 'jewish'] },
  { emoji: '🕎', keywords: ['menorah', 'jewish', 'hanukkah', 'religion'] },
  { emoji: '☯️', keywords: ['yin', 'yang', 'balance', 'taoism', 'philosophy'] },
  { emoji: '☦️', keywords: ['orthodox', 'cross', 'christian', 'religion'] },
  { emoji: '🛐', keywords: ['place', 'worship', 'religion', 'prayer'] },
  { emoji: '⛎', keywords: ['ophiuchus', 'zodiac', 'astrology'] },
  { emoji: '♈', keywords: ['aries', 'zodiac', 'astrology', 'ram'] },
  { emoji: '♉', keywords: ['taurus', 'zodiac', 'astrology', 'bull'] },
  { emoji: '♊', keywords: ['gemini', 'zodiac', 'astrology', 'twins'] },
  { emoji: '♋', keywords: ['cancer', 'zodiac', 'astrology', 'crab'] },
  { emoji: '♌', keywords: ['leo', 'zodiac', 'astrology', 'lion'] },
  { emoji: '♍', keywords: ['virgo', 'zodiac', 'astrology', 'maiden'] },
  { emoji: '♎', keywords: ['libra', 'zodiac', 'astrology', 'scales'] },
  { emoji: '♏', keywords: ['scorpio', 'zodiac', 'astrology', 'scorpion'] },
  { emoji: '♐', keywords: ['sagittarius', 'zodiac', 'astrology', 'archer'] },
  { emoji: '♑', keywords: ['capricorn', 'zodiac', 'astrology', 'goat'] },
  { emoji: '♒', keywords: ['aquarius', 'zodiac', 'astrology', 'water', 'bearer'] },
  { emoji: '♓', keywords: ['pisces', 'zodiac', 'astrology', 'fish'] },
  { emoji: '🆔', keywords: ['identification', 'card', 'id', 'identity'] },
  { emoji: '⚛️', keywords: ['atom', 'symbol', 'science', 'physics'] },
  { emoji: '🉑', keywords: ['circled', 'ideograph', 'acceptable', 'ok', 'chinese'] },
  { emoji: '☢️', keywords: ['radioactive', 'danger', 'nuclear', 'warning'] },
  { emoji: '☣️', keywords: ['biohazard', 'danger', 'warning', 'toxic'] },
];

// Group emojis by category for display
const EMOJI_CATEGORIES = [
  {
    name: 'Faces',
    emojis: EMOJI_DATA.filter(e => e.keywords.some(k => ['face', 'smile', 'happy', 'sad', 'angry', 'cry', 'laugh'].includes(k))).map(e => e.emoji),
  },
  {
    name: 'Food & Drinks',
    emojis: EMOJI_DATA.filter(e => e.keywords.some(k => ['food', 'drink', 'eat', 'coffee', 'pizza', 'burger', 'cake'].includes(k))).map(e => e.emoji),
  },
  {
    name: 'Activities',
    emojis: EMOJI_DATA.filter(e => e.keywords.some(k => ['sport', 'game', 'music', 'dance', 'play'].includes(k))).map(e => e.emoji),
  },
  {
    name: 'Objects',
    emojis: EMOJI_DATA.filter(e => e.keywords.some(k => ['phone', 'computer', 'camera', 'tool', 'money'].includes(k))).map(e => e.emoji),
  },
  {
    name: 'Symbols',
    emojis: EMOJI_DATA.filter(e => e.keywords.some(k => ['heart', 'love', 'symbol', 'religion', 'zodiac'].includes(k))).map(e => e.emoji),
  },
];

interface EmojiPickerProps {
  value?: string;
  onChange: (emoji: string) => void;
  placeholder?: string;
}

export function EmojiPicker({ value = '', onChange, placeholder = 'Select emoji' }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter emojis based on search query
  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) {
      return EMOJI_CATEGORIES;
    }

    const query = searchQuery.toLowerCase().trim();
    const matchingEmojis = EMOJI_DATA.filter(emojiData =>
      emojiData.keywords.some(keyword => keyword.includes(query))
    ).map(e => e.emoji);

    if (matchingEmojis.length === 0) {
      return [];
    }

    return [{
      name: 'Search Results',
      emojis: matchingEmojis,
    }];
  }, [searchQuery]);

  const handleEmojiClick = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery('');
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
        >
          <span className={value ? 'text-2xl' : 'text-sm text-gray-400'}>
            {value || placeholder}
          </span>
          <div className="flex items-center gap-2">
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                aria-label="Clear emoji"
              >
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
        {/* Search Bar */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                aria-label="Clear search"
              >
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Emoji Grid */}
        <div className="max-h-[380px] overflow-y-auto p-4 emoji-scrollbar">
          {filteredEmojis.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No emojis found
              </p>
            </div>
          ) : (
            filteredEmojis.map((category) => (
              <div key={category.name} className="mb-6 last:mb-0">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 px-1">
                  {category.name}
                </h3>
                <div className="grid grid-cols-8 gap-1">
                  {category.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-2xl hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-all duration-150 active:scale-95 flex items-center justify-center aspect-square"
                      aria-label={`Select ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

