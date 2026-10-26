import { RESOURCE_CONTENT } from '@/content/resources';
import { Pill, ResourceHero, ResourceLayout, SectionHeader } from '@/screens/resources/resource-layout';
import { VideoCard } from '@/screens/resources/video-card';

export default function VideosScreen() {
  const [featured, ...rest] = RESOURCE_CONTENT.videos;
  const total = RESOURCE_CONTENT.videos.length;

  return (
    <ResourceLayout title="Special Videos">
      <ResourceHero
        icon="smart-display"
        eyebrow="Video library"
        title="Learn with TURANEZA"
        body="Explore collaborative housing, meet the people behind the project, and follow the app walkthrough."
      />

      <SectionHeader title="Start here" trailing={<Pill label={`${total} videos`} tone="neutral" />} />
      <VideoCard video={featured} badge="Featured" />

      <SectionHeader title="Keep watching" />
      {rest.map((video, index) => (
        <VideoCard key={video.id} video={video} badge={`Video ${index + 2} of ${total}`} />
      ))}
    </ResourceLayout>
  );
}
