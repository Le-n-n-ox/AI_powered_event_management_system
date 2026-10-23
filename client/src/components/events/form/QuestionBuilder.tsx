import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  AtSign,
  Check,
  ChevronDownSquare,
  CircleHelp,
  Hash,
  Phone,
  Plus,
  RotateCcw,
  TextCursorInput,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import type {
  EventFormData,
  EventFormUpdater,
  RegistrationQuestion,
  RegistrationQuestionType,
} from "../../../types/event";
import {
  BUILT_IN_QUESTIONS,
  QUESTION_TYPES,
  newQuestionId,
} from "../../../lib/registrationQuestions";

interface Props {
  data: EventFormData;
  updateData: EventFormUpdater;
  inputCls: string;
}

const TYPE_ICON: Record<RegistrationQuestionType, LucideIcon> = {
  short_text: TextCursorInput,
  long_text: AlignLeft,
  number: Hash,
  email: AtSign,
  phone: Phone,
  select: ChevronDownSquare,
  checkbox: Check,
};

const TYPE_LABEL: Record<RegistrationQuestionType, string> = {
  short_text: "Short answer",
  long_text: "Long answer",
  number: "Number",
  email: "Email",
  phone: "Phone",
  select: "Choice",
  checkbox: "Yes / No",
};

/** The accent that tints a question's chip, cycling through the tag colours. */
const ACCENTS = [
  "bg-tag-violet-bg text-tag-violet",
  "bg-tag-teal-bg text-tag-teal",
  "bg-tag-sky-bg text-tag-sky",
  "bg-tag-pink-bg text-tag-pink",
  "bg-tag-amber-bg text-tag-amber",
];

const CHECKBOX =
  "w-4 h-4 rounded border-border text-brand focus:ring-focus accent-brand";

export default function QuestionBuilder({ data, updateData, inputCls }: Props) {
  const [adding, setAdding] = useState(false);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftType, setDraftType] = useState<RegistrationQuestionType>(
    "short_text",
  );
  const [draftRequired, setDraftRequired] = useState(false);
  const [draftOptions, setDraftOptions] = useState("");

  const questions = data.registrationQuestions;
  const isEmpty = questions.length === 0;

  const commit = (next: RegistrationQuestion[]) =>
    updateData("registrationQuestions", next);

  const updateAt = (index: number, patch: Partial<RegistrationQuestion>) => {
    const next = questions.map((question, i) =>
      i === index ? { ...question, ...patch } : question,
    );
    commit(next);
  };

  const removeAt = (index: number) => {
    commit(questions.filter((_, i) => i !== index));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;
    const next = [...questions];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  };

  const addQuestion = () => {
    const label = draftLabel.trim();
    if (!label) return;

    const options = draftOptions
      .split("\n")
      .map((option) => option.trim())
      .filter(Boolean);

    const question: RegistrationQuestion = {
      id: newQuestionId(),
      label,
      type: draftType,
      required: draftRequired,
    };

    if (draftType === "select" && options.length) question.options = options;

    commit([...questions, question]);
    setDraftLabel("");
    setDraftType("short_text");
    setDraftRequired(false);
    setDraftOptions("");
    setAdding(false);
  };

  const restoreDefaults = () => commit([...BUILT_IN_QUESTIONS]);

  return (
    <div className="rounded-2xl border border-border bg-surface-muted/40 p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-heading text-sm font-semibold text-text flex items-center gap-2">
            <CircleHelp className="w-4 h-4 text-tag-violet" />
            Registration questions
          </h4>
          <p className="text-xs text-text-soft mt-1 max-w-md">
            Choose what attendees are asked. Tick a field to make it required,
            add your own questions, or clear the list to ask nothing at all.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEmpty ? (
            <button
              type="button"
              onClick={restoreDefaults}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-tag-violet hover:underline underline-offset-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore defaults
            </button>
          ) : (
            <button
              type="button"
              onClick={() => commit([])}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger hover:underline underline-offset-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove all
            </button>
          )}
        </div>
      </div>

      {/* The list of questions the attendee will see */}
      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {questions.map((question, index) => {
            const Icon = TYPE_ICON[question.type];
            const accent = ACCENTS[index % ACCENTS.length];

            return (
              <motion.li
                key={question.id}
                layout
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -16, scale: 0.97 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="group flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 shadow-sm shadow-shadow-soft"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex shrink-0 p-1.5 rounded-lg ${accent}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </span>

                  <input
                    value={question.label}
                    onChange={(e) =>
                      updateAt(index, { label: e.target.value })
                    }
                    placeholder="Question label"
                    aria-label={`Label for question ${index + 1}`}
                    className={`flex-1 min-w-0 ${inputCls} !py-1.5 !text-sm`}
                  />

                  <span className="hidden sm:inline shrink-0 text-[11px] font-semibold uppercase tracking-wide text-text-soft">
                    {TYPE_LABEL[question.type]}
                  </span>

                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label="Move question up"
                      className="p-1.5 rounded-lg text-text-soft hover:text-text hover:bg-surface-strong disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === questions.length - 1}
                      aria-label="Move question down"
                      className="p-1.5 rounded-lg text-text-soft hover:text-text hover:bg-surface-strong disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAt(index)}
                      aria-label={`Remove ${question.label || "question"}`}
                      className="p-1.5 rounded-lg text-text-soft hover:text-danger hover:bg-danger-bg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pl-1">
                  <label className="inline-flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) =>
                        updateAt(index, { required: e.target.checked })
                      }
                      className={CHECKBOX}
                    />
                    Required
                  </label>

                  {question.builtin && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-tag-teal">
                      <Check className="w-3 h-3" />
                      Maps to an attendee field
                    </span>
                  )}

                  {question.type === "select" && (
                    <input
                      value={(question.options ?? []).join(", ")}
                      onChange={(e) =>
                        updateAt(index, {
                          options: e.target.value
                            .split(",")
                            .map((option) => option.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Option one, Option two"
                      aria-label={`Choices for ${question.label || "question"}`}
                      className={`flex-1 min-w-[12rem] ${inputCls} !py-1.5 !text-xs`}
                    />
                  )}
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>

        {isEmpty && (
          <motion.li
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-dashed border-border-strong bg-surface/50 px-4 py-6 text-center"
          >
            <p className="text-sm font-medium text-text">
              No questions will be asked
            </p>
            <p className="text-xs text-text-soft mt-1">
              Attendees will only tick the terms box and submit. Add a question
              below, or restore the defaults.
            </p>
          </motion.li>
        )}
      </ul>

      {/* Add a new question */}
      <AnimatePresence initial={false}>
        {adding ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-brand-border bg-brand-soft/40 p-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-strong">
                  New question
                </span>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  aria-label="Cancel adding a question"
                  className="p-1 rounded-lg text-text-soft hover:text-text hover:bg-surface-strong transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addQuestion();
                  }
                }}
                placeholder="e.g. T-shirt size"
                aria-label="New question label"
                className={inputCls}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={draftType}
                  onChange={(e) =>
                    setDraftType(e.target.value as RegistrationQuestionType)
                  }
                  aria-label="New question type"
                  className={inputCls}
                >
                  {QUESTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} — {type.description}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draftRequired}
                    onChange={(e) => setDraftRequired(e.target.checked)}
                    className={CHECKBOX}
                  />
                  Attendee must answer this
                </label>
              </div>

              {draftType === "select" && (
                <textarea
                  value={draftOptions}
                  onChange={(e) => setDraftOptions(e.target.value)}
                  rows={3}
                  placeholder={"One option per line\nSmall\nMedium\nLarge"}
                  aria-label="Choices for the new question"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text shadow-sm transition-colors placeholder:text-text-soft focus-visible:outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus-soft resize-y"
                />
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-text-muted bg-surface border border-border rounded-lg hover:bg-surface-alt transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addQuestion}
                  disabled={!draftLabel.trim()}
                  className="px-3 py-1.5 text-xs font-semibold text-text-on-dark bg-linear-to-r from-brand to-tag-violet rounded-lg shadow-md shadow-shadow-brand/30 hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  Add question
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            type="button"
            onClick={() => setAdding(true)}
            initial={false}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface/50 px-4 py-2.5 text-sm font-semibold text-brand-strong hover:border-brand hover:bg-brand-soft/50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add a question
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
