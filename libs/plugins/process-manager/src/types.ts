export type Job = {
    _id: string
    name: string
    deadline: number
    workflowId: string
    autoaction: string
    stepData: Record<string, string | number>
    state: ProcessState
}

export type PMResponse = {
    status: number
    message?: string
    workflow?: Workflow
    items?: NotificationItem[]
}

export type Workflow = {
    _id: string
    index: number
    name: string
    description: string
    steps: Step[]
    connections: Record<string, string[]>
    startstep: string
    history: { stepId: string; completedat: number }[]
    owner: number
    state: ProcessState
    majorsteps: string[]
}

export type Step = {
    _id: string
    name: string
    description: string
    type: StepType
    trigger: string
    responsible?: number
    state: ProcessState
    delay?: {
        value: number
        unit: TimeUnit
    }
    data?: Record<string, string | number>
}

export enum ProcessState {
    NotStarted = "Nicht gestartet",
    Processing = "Prozessieren",
    Pending = "Aktiv",
    Completed = "Abgeschlossen",
    Blocked = "Gesperrt",
    Aborted = "Abgebrochen",
    Skipped = "Übersprungen",
}

export enum StepType {
    Automatic = "Automatisch",
    Manual = "Manuell",
}

export type AutomaticStepTemplate = {
    _id: string
    index: number
    trigger: string
    data: Record<string, DataFieldProperties>
    helptext: string
}

export enum TimeUnit {
    Minutes = "Minuten",
    Hours = "Stunden",
    Days = "Tage",
    Weeks = "Wochen",
    Months = "Monate",
    Years = "Jahre",
}

export type DataFieldProperties = {
    name: string
    helpText?: string
    multiline?: boolean
    required?: boolean
    type?: string
}

export type NotificationItem = {
    _id: string
    workflow: string // Name of the workflow
    nextSteps: Step[]
}
