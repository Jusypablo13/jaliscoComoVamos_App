import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandColors, typography } from '../styles/theme';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../hooks/use-auth-context';
import { LoginScreen } from './login';

// Comment data from Supabase
export interface CommentData {
    id: string;
    created_at: string;
    comment_content: string;
    user_id: string;
}

interface CommentsSectionProps {
    questionId: string;
}

// Format date to human-readable format
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
        return 'Justo ahora';
    } else if (diffMinutes < 60) {
        return `Hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHours < 24) {
        return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffDays < 7) {
        return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    } else {
        return date.toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    }
};

export const CommentsSection = ({ questionId }: CommentsSectionProps) => {
    const { session } = useAuthContext();
    const [comments, setComments] = useState<CommentData[]>([]);
    const [inputText, setInputText] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('comments')
                .select('id, created_at, comment_content, user_id')
                .eq('question_id', questionId)
                .order('created_at', { ascending: false });

            if (fetchError) {
                console.error('Error fetching comments:', fetchError);
                setError('No se pudieron cargar los comentarios.');
                return;
            }

            setComments(data || []);
        } catch (err) {
            console.error('Error fetching comments:', err);
            setError('Error al cargar los comentarios.');
        } finally {
            setIsLoading(false);
        }
    }, [questionId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleInputFocus = () => {
        if (!session) {
            inputRef.current?.blur();
            setShowAuthModal(true);
        }
    };

    const handleSendComment = async () => {
        const trimmedText = inputText.trim();
        if (!trimmedText) return;

        if (!session) {
            setShowAuthModal(true);
            return;
        }

        setIsPosting(true);
        setError(null);

        try {
            const { data, error: insertError } = await supabase
                .from('comments')
                .insert({
                    comment_content: trimmedText,
                    user_id: session.user.id,
                    question_id: questionId,
                })
                .select('id, created_at, comment_content, user_id')
                .single();

            if (insertError) {
                console.error('Error posting comment:', insertError);
                setError('No se pudo publicar el comentario.');
                return;
            }

            // Add the new comment at the beginning (newest first)
            if (data) {
                setComments(prev => [data, ...prev]);
            }
            setInputText('');
        } catch (err) {
            console.error('Error posting comment:', err);
            setError('Error al publicar el comentario.');
        } finally {
            setIsPosting(false);
        }
    };

    const handleAuthSuccess = () => {
        setShowAuthModal(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Comentarios</Text>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={brandColors.primary} />
                    <Text style={styles.loadingText}>Cargando comentarios...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchComments}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.listContainer}>
                    {comments.length === 0 ? (
                        <Text style={styles.emptyText}>No hay comentarios aún. ¡Sé el primero en comentar!</Text>
                    ) : (
                        comments.map((comment) => (
                            <View key={comment.id} style={styles.commentCard}>
                                <View style={styles.commentHeader}>
                                    <Text style={styles.userId}>Usuario</Text>
                                    <Text style={styles.date}>{formatDate(comment.created_at)}</Text>
                                </View>
                                <Text style={styles.content}>{comment.comment_content}</Text>
                            </View>
                        ))
                    )}
                </View>
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder={session ? "Escribe un comentario..." : "Inicia sesión para comentar..."}
                    placeholderTextColor={brandColors.muted}
                    value={inputText}
                    onChangeText={setInputText}
                    onFocus={handleInputFocus}
                    multiline
                    editable={!isLoading}
                />
                <TouchableOpacity
                    style={[styles.sendButton, (!inputText.trim() || isPosting || isLoading) && styles.sendButtonDisabled]}
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

            {/* Auth Modal */}
            <Modal
                visible={showAuthModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowAuthModal(false)}
            >
                <View style={styles.authModalContainer}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowAuthModal(false)}
                    >
                        <Ionicons name="close" size={28} color={brandColors.text} />
                    </TouchableOpacity>
                    <LoginScreen onAuthSuccess={handleAuthSuccess} />
                </View>
            </Modal>
        </View>
    );
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
    errorContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12
    },
    errorText: {
        fontFamily: typography.regular,
        color: brandColors.accent,
        fontSize: 14,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: brandColors.primary,
        borderRadius: 20,
    },
    retryButtonText: {
        fontFamily: typography.emphasis,
        color: '#FFF',
        fontSize: 14,
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
    userId: {
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
    authModalContainer: {
        flex: 1,
        backgroundColor: brandColors.background,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 8,
    },
});