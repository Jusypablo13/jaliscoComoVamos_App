import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors, typography } from '../styles/theme'; 

// Payload
export interface CommentData {
    id: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: string;
}

interface CommentsSectionProps {
    questionId: string;
}

// Mock data
const mockComments: CommentData[] = [
    {
        id: '1',
        userId: 'u1',
        userName: 'Casique',
        content: 'Todo es culpa de Morena',
        createdAt: 'Hace 2 horas'
    },
    {
        id: '2',
        userId: 'u2',
        userName: 'Bernie',
        content: 'lol que mal',
        createdAt: 'Hace 5 horas'
    }
];

// Mock db
const mockDb: Record<string, CommentData[]> = {
    '1': [
        { id: '10', userId: 'u2', userName: 'José Pablo', content: 'Tung Tung Tung Sahur', createdAt: 'Hace 2 horas' }
    ]
}

export const CommentsSection = ({ questionId }: CommentsSectionProps) => {
    const [comments, setComments] = useState<CommentData[]>([]);
    const [inputText, setInputText] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCommentsForQuestion();
    }, [questionId]);

    const loadCommentsForQuestion = () => {
        setIsLoading(true);

        setTimeout(() => {
            const specificComments = mockDb[questionId] || [
                { 
                    id: `gen-${Date.now()}`, 
                    userId: 'sys', 
                    userName: 'Sistema', 
                    content: `Aún no hay comentarios para esta pregunta (${questionId})`, 
                    createdAt: 'Ahora' 
                }
            ];

            setComments(specificComments);
            setIsLoading(false);
        }, 600); // Carga falsa (simulación)
    }

    const handleSendComment = () => {
        if (!inputText.trim()) return;

        setIsPosting(true);

        // Simular la llamada a la API
        setTimeout(() => {
            const newComment: CommentData = {
                id: Date.now().toString(),
                userId: 'me', // ID del usuario actual
                userName: 'Pau', // Nombre del usuario actual
                content: inputText,
                createdAt: 'Justo ahora'
            };

            setComments(prev => [...prev, newComment]);
            setInputText('');
            setIsPosting(false);
        }, 1000);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}> Comentarios </Text>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={brandColors.primary} />
                    <Text style={styles.loadingText}>Cargando comentarios...</Text>
                </View>
            ) : (
                <View style={styles.listContainer}>
                    {comments.length === 0 ? (
                        <Text style={styles.emptyText}>No hay comentarios aún.</Text>
                    ) : (
                        comments.map((comment) => (
                            <View key={comment.id} style={styles.commentCard}>
                                <View style={styles.commentHeader}>
                                    <Text style={styles.userName}>{comment.userName}</Text>
                                    <Text style={styles.date}>{comment.createdAt}</Text>
                                </View>
                                <Text style={styles.content}>{comment.content}</Text>
                            </View>
                        ))
                    )}
                </View>
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Escribe un comentario..."
                    placeholderTextColor={brandColors.muted}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                />
                <TouchableOpacity 
                    style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
                    onPress={handleSendComment}
                    disabled={!inputText.trim() || isPosting || isLoading}
                >
                    {isPosting ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Ionicons name="send" size={20} color="#FFF" />
                    )}
                </TouchableOpacity>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        padding: 16,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E4EA',
    },
    title: {
        fontFamily: typography.heading,
        fontSize: 18,
        color: brandColors.text,
        marginBottom: 16,
    },
    listContainer: {
        marginBottom: 16,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    },
    loadingText: {
        fontFamily: typography.regular,
        color: brandColors.muted,
        fontSize: 12
    },
    commentCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    userName: {
        fontFamily: typography.emphasis,
        fontSize: 14,
        color: brandColors.primary,
    },
    date: {
        fontFamily: typography.regular,
        fontSize: 12,
        color: brandColors.muted,
    },
    content: {
        fontFamily: typography.regular,
        fontSize: 14,
        color: brandColors.text,
        lineHeight: 20,
    },
    emptyText: {
        fontFamily: typography.regular,
        color: brandColors.muted,
        textAlign: 'center',
        paddingVertical: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        minHeight: 44,
        maxHeight: 100,
        fontFamily: typography.regular,
        fontSize: 14,
        color: brandColors.text,
        borderWidth: 1,
        borderColor: '#E0E4EA',
    },
    sendButton: {
        backgroundColor: brandColors.primary,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
});