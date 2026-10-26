import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import ArticlesScreen from '@/screens/resources/articles-screen';
import ContactScreen from '@/screens/resources/contact-screen';
import HelpCenterScreen from '@/screens/resources/help-center-screen';
import LegalScreen from '@/screens/resources/legal-screen';
import QuizScreen from '@/screens/resources/quiz-screen';
import VideosScreen from '@/screens/resources/videos-screen';
import { ResourceCard, ResourceLayout } from '@/screens/resources/resource-layout';

export default function ResourceScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  switch (slug) {
    case 'help-center': return <HelpCenterScreen />;
    case 'quiz': return <QuizScreen />;
    case 'legal': return <LegalScreen />;
    case 'special-videos': return <VideosScreen />;
    case 'articles': return <ArticlesScreen />;
    case 'contact': return <ContactScreen />;
    default:
      return (
        <ResourceLayout title="Page not found">
          <ResourceCard><Text>This page is not available.</Text></ResourceCard>
        </ResourceLayout>
      );
  }
}
