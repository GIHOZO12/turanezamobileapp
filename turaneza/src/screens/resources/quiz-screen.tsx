import { MaterialIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { RESOURCE_CONTENT } from '@/content/resources';
import colors from '@/constants/colors';
import { cn } from '@/lib/cn';
import { Banner, Pill, ResourceBody, ResourceCard, ResourceHero, ResourceLayout } from '@/screens/resources/resource-layout';

const QUESTIONS_PER_SLIDE = 5;
const PASS_PERCENT = 80;
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

function certificateHtml(name: string, date: string) {
  const safeName = escapeHtml(name);
  const safeDate = escapeHtml(date);
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"/><style>
    @page { size: landscape; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 28px; background: #f1f4f8; color: #172033; font-family: Arial, sans-serif; }
    .certificate { height: 540px; padding: 64px 56px; background: #fff; border: 3px solid #1e58c8; outline: 1px solid #d3dce8; outline-offset: -14px; text-align: center; }
    .brand { color: #1e58c8; letter-spacing: 4px; font-size: 18px; font-weight: bold; }
    h1 { margin: 42px 0 12px; font-family: Georgia, serif; font-size: 38px; }
    .recipient { margin: 26px auto 18px; padding-bottom: 10px; border-bottom: 1px solid #aab6c7; width: 72%; font: bold 30px Georgia, serif; }
    p { margin: 8px auto; max-width: 680px; color: #566174; font-size: 15px; line-height: 1.6; }
    .issued { margin-top: 30px; color: #566174; font-size: 14px; }
    .signatures { display: flex; justify-content: space-between; margin: 44px auto 0; width: 78%; color: #566174; font-size: 12px; }
    .signatures span { width: 210px; padding-top: 9px; border-top: 1px solid #aab6c7; }
  </style></head><body><main class="certificate"><div class="brand">URBAN EVOLUTION GROUP</div><h1>Certificate of Completion</h1><p>This certificate is proudly presented to</p><div class="recipient">${safeName}</div><p>You have demonstrated a strong understanding of how the TURANEZA App functions<br/>and are able to create and run a group responsibly as a Group Admin.</p><div class="issued">Issued on ${safeDate}</div><div class="signatures"><span>Urban Evolution Group</span><span>Platform Recognition</span></div></main></body></html>`;
}

export default function QuizScreen() {
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState<Array<number | null>>(() => Array(RESOURCE_CONTENT.quiz.length).fill(null));
  const [slide, setSlide] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const slideCount = Math.ceil(RESOURCE_CONTENT.quiz.length / QUESTIONS_PER_SLIDE);
  const currentQuestions = RESOURCE_CONTENT.quiz.slice(slide * QUESTIONS_PER_SLIDE, (slide + 1) * QUESTIONS_PER_SLIDE);
  const slideStart = slide * QUESTIONS_PER_SLIDE;
  const score = useMemo<number>(
    () => submitted ? answers.reduce<number>((total, answer, index) => total + (answer === RESOURCE_CONTENT.quiz[index].correctIndex ? 1 : 0), 0) : 0,
    [answers, submitted],
  );
  const percent = Math.round((score / RESOURCE_CONTENT.quiz.length) * 100);
  const passed = submitted && percent >= PASS_PERCENT;
  const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  function scrollToTop() {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  function allCurrentAnswered() {
    return answers.slice(slideStart, slideStart + currentQuestions.length).every((answer) => answer !== null);
  }

  function chooseAnswer(questionIndex: number, answerIndex: number) {
    if (submitted) return;
    setAnswers((previous) => previous.map((answer, index) => index === questionIndex ? answerIndex : answer));
    setError('');
  }

  function nextSlide() {
    if (!allCurrentAnswered()) {
      setError('Answer all five questions on this slide before continuing.');
      return;
    }
    setError('');
    setSlide((current) => Math.min(slideCount - 1, current + 1));
    scrollToTop();
  }

  function submitQuiz() {
    if (name.trim().length < 2) {
      setError('Enter your full name before submitting the quiz.');
      scrollToTop();
      return;
    }
    if (!allCurrentAnswered()) {
      setError('Answer all questions on this slide before submitting.');
      return;
    }
    setError('');
    setSubmitted(true);
    scrollToTop();
  }

  function restartQuiz() {
    setAnswers(Array(RESOURCE_CONTENT.quiz.length).fill(null));
    setSlide(0);
    setSubmitted(false);
    setError('');
    scrollToTop();
  }

  async function viewCertificate() {
    setIsGenerating(true);
    try {
      await Print.printAsync({ html: certificateHtml(name.trim(), date), orientation: Print.Orientation.landscape });
    } catch {
      Alert.alert('Could not open certificate', 'Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function shareCertificate() {
    setIsGenerating(true);
    try {
      const { uri } = await Print.printToFileAsync({ html: certificateHtml(name.trim(), date), width: 842, height: 595 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: '.pdf', dialogTitle: 'Save your TURANEZA certificate' });
      } else {
        Alert.alert('Sharing is unavailable', 'Your certificate PDF was created, but this device cannot share it.');
      }
    } catch {
      Alert.alert('Could not create certificate', 'Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  const answeredCount = answers.filter((answer) => answer !== null).length;
  const total = RESOURCE_CONTENT.quiz.length;
  const stats = [
    { value: `${total}`, label: 'Questions' },
    { value: `${slideCount}`, label: 'Sections' },
    { value: `${PASS_PERCENT}%`, label: 'To pass' },
  ];

  return (
    <ResourceLayout title="Quiz" scrollRef={scrollRef}>
      {submitted ? (
        <ResourceCard className="items-center gap-md py-lg">
          <View className={cn('h-32 w-32 items-center justify-center rounded-full border-[10px]', passed ? 'border-secondary-fixed-dim' : 'border-error-container')}>
            <Text className="font-display-lg text-[32px] leading-10 text-on-surface">{percent}%</Text>
          </View>
          <Pill label={passed ? 'Passed' : `Below ${PASS_PERCENT}%`} icon={passed ? 'check-circle' : 'info-outline'} tone={passed ? 'secondary' : 'error'} />
          <View className="items-center gap-xs">
            <Text className="text-center font-headline-md text-[20px] leading-7 text-on-surface">
              {passed ? `Well done, ${name.trim()}!` : 'Almost there'}
            </Text>
            <Text className="text-center font-body-md text-body-md text-on-surface-variant">
              You answered {score} of {total} questions correctly.
              {passed ? '' : ` A minimum score of ${PASS_PERCENT}% is required for a certificate.`}
            </Text>
          </View>

          {passed ? (
            <View className="w-full gap-sm rounded bg-tertiary-fixed/60 p-md">
              <View className="flex-row items-center gap-sm">
                <MaterialIcons name="workspace-premium" size={32} color={colors.tertiary} />
                <View className="flex-1">
                  <Text className="font-label-sm text-label-sm uppercase tracking-widest text-on-tertiary-fixed-variant">Certificate ready</Text>
                  <Text className="font-label-md text-label-md text-on-surface">Download your completion certificate as a PDF</Text>
                </View>
              </View>
              <ResourceBody>It recognises your understanding of the TURANEZA App and responsible group administration.</ResourceBody>
              <View className="flex-row gap-sm">
                <Button label="View" variant="secondary" disabled={isGenerating} onPress={viewCertificate} className="flex-1" />
                <Button label="Save / share" loading={isGenerating} onPress={shareCertificate} className="flex-1" />
              </View>
            </View>
          ) : null}

          <Text className="text-center font-label-md text-label-md text-on-surface-variant">Scroll down to review your answers.</Text>
          <Button
            label="Restart quiz"
            variant="secondary"
            onPress={restartQuiz}
            icon={<MaterialIcons name="refresh" size={18} color={colors.primary} />}
            className="w-full"
          />
        </ResourceCard>
      ) : (
        <ResourceHero
          icon="quiz"
          eyebrow="Group Admin quiz"
          title="TURANEZA readiness quiz"
          body={`Answer all ${total} questions across ${slideCount} sections. Score at least ${PASS_PERCENT}% to earn your certificate.`}>
          <View className="flex-row gap-sm pt-xs">
            {stats.map((stat) => (
              <View key={stat.label} className="flex-1 rounded-sm bg-on-primary/10 px-sm py-sm">
                <Text className="font-headline-md text-[20px] leading-7 text-on-primary">{stat.value}</Text>
                <Text className="font-label-sm text-label-sm text-primary-fixed">{stat.label}</Text>
              </View>
            ))}
          </View>
        </ResourceHero>
      )}

      <ResourceCard>
        <Text className="font-label-md text-label-md text-on-surface">Your full name</Text>
        <TextField
          icon="badge"
          value={name}
          onChangeText={setName}
          editable={!submitted}
          placeholder="Enter your full name"
          autoCapitalize="words"
          accessibilityLabel="Full name"
        />
        <Text className="font-body-md text-label-md text-on-surface-variant">This is the name printed on your certificate.</Text>
      </ResourceCard>

      <ResourceCard>
        <View className="flex-row items-center justify-between">
          <Text className="font-label-md text-label-md text-on-surface">Section {slide + 1} of {slideCount}</Text>
          <Text className="font-label-sm text-label-sm text-on-surface-variant">{answeredCount}/{total} answered</Text>
        </View>
        <View className="flex-row gap-xs">
          {Array.from({ length: slideCount }, (_, index) => (
            <View
              key={index}
              className={cn('h-[6px] flex-1 rounded-full', index < slide ? 'bg-primary' : index === slide ? 'bg-primary-fixed-dim' : 'bg-surface-container-high')}
            />
          ))}
        </View>
      </ResourceCard>

      {currentQuestions.map((question, questionOffset) => {
        const questionIndex = slideStart + questionOffset;
        const selectedAnswer = answers[questionIndex];
        const correct = submitted && selectedAnswer === question.correctIndex;
        return (
          <ResourceCard key={`question-${questionIndex}`} className="gap-md">
            <View className="flex-row items-start gap-sm">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-primary-fixed">
                <Text className="font-label-sm text-label-sm text-on-primary-fixed-variant">{questionIndex + 1}</Text>
              </View>
              <Text className="flex-1 font-label-md text-[16px] leading-6 text-on-surface">{question.question}</Text>
            </View>
            {submitted && <Pill label={correct ? 'Correct' : 'Incorrect'} icon={correct ? 'check' : 'close'} tone={correct ? 'secondary' : 'error'} />}
            <View className="gap-base">
              {question.options.map((option, optionIndex) => {
                const isSelected = selectedAnswer === optionIndex;
                const isCorrectOption = submitted && optionIndex === question.correctIndex;
                const isWrongPick = submitted && isSelected && !isCorrectOption;
                const look = isCorrectOption
                  ? { row: 'border-secondary bg-secondary-container/30', badge: 'bg-secondary', text: 'text-on-secondary', icon: 'check' as const }
                  : isWrongPick
                    ? { row: 'border-error bg-error-container', badge: 'bg-error', text: 'text-on-error', icon: 'close' as const }
                    : isSelected
                      ? { row: 'border-primary bg-primary-fixed/50', badge: 'bg-primary', text: 'text-on-primary', icon: null }
                      : { row: 'border-outline-variant/60 bg-surface-container-lowest', badge: 'bg-surface-container-high', text: 'text-on-surface-variant', icon: null };
                return (
                  <Pressable
                    key={`${questionIndex}-${optionIndex}`}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    disabled={submitted}
                    onPress={() => chooseAnswer(questionIndex, optionIndex)}
                    className={cn('flex-row items-center gap-sm rounded border px-sm py-sm active:opacity-80', look.row)}>
                    <View className={cn('h-7 w-7 items-center justify-center rounded-full', look.badge)}>
                      {look.icon ? (
                        <MaterialIcons name={look.icon} size={16} color={isCorrectOption ? colors['on-secondary'] : colors['on-error']} />
                      ) : (
                        <Text className={cn('font-label-sm text-label-sm', look.text)}>{OPTION_LETTERS[optionIndex]}</Text>
                      )}
                    </View>
                    <Text className="flex-1 font-body-md text-[15px] leading-[22px] text-on-surface">{option}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ResourceCard>
        );
      })}

      {error ? <Banner kind="error" text={error} /> : null}

      <View className="flex-row gap-sm">
        <Button
          label="Previous"
          variant="secondary"
          disabled={slide === 0}
          onPress={() => { setError(''); setSlide((current) => Math.max(0, current - 1)); scrollToTop(); }}
          className="flex-1"
        />
        {slide < slideCount - 1 ? (
          <Button label="Next" onPress={nextSlide} className="flex-1" />
        ) : submitted ? (
          <Button label="Restart quiz" onPress={restartQuiz} className="flex-1" />
        ) : (
          <Button label="Submit quiz" onPress={submitQuiz} className="flex-1" />
        )}
      </View>
    </ResourceLayout>
  );
}
