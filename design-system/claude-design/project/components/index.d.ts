// window.OfficePower: the shared components of the Office Power workspace (React 18).
import type {ComponentType, ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, HTMLAttributes, ImgHTMLAttributes} from 'react';

type IconComponent = ComponentType<{size?: number; 'aria-hidden'?: boolean | 'true'}>;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary: the one main action of an area. Omit for secondary. ghost: cancel and close. plain: no chrome, sizes itself. danger currently renders like primary; do not use it for delete. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'plain' | 'danger';
  /** default 44px, medium 36px, small 28px. */
  size?: 'default' | 'medium' | 'small';
  /** Shows a spinner, disables the button and sets aria-busy. */
  loading?: boolean;
  /** Square button with only an icon; pass aria-label. */
  iconOnly?: boolean;
}

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Outer tag, article by default. */
  as?: keyof JSX.IntrinsicElements;
}

export interface BadgeProps {
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
  children: ReactNode;
}

export interface FormFieldProps {
  label: ReactNode;
  /** Help text under the field; replaced by error when error is set. */
  hint?: ReactNode;
  /** Error message, announced with role="alert"; marks the field aria-invalid. */
  error?: ReactNode;
  id?: string;
  /** Exactly one field element; receives id, aria-invalid and aria-describedby. */
  children: ReactNode;
}

export interface DialogProps {
  title: ReactNode;
  description?: ReactNode;
  /** Placed left of the close button. */
  headerAction?: ReactNode;
  children?: ReactNode;
  /** Called by the close button and Escape. The dialog opens on mount and closes on unmount. */
  onClose: () => void;
  /** Buttons, right-aligned: [cancel ghost] [main primary]. */
  footer?: ReactNode;
  size?: string;
  className?: string;
}

export interface DataTableColumn<Row> {
  key: string;
  label: ReactNode;
  render?: (row: Row) => ReactNode;
}

export interface DataTableProps<Row = Record<string, unknown>> {
  caption: string;
  columns: DataTableColumn<Row>[];
  rows: Row[];
  getKey?: (row: Row) => string | number;
  /** Shown when rows is empty. Default 沒有符合的資料. */
  empty?: ReactNode;
}

export interface ResourceListProps {
  label: string;
  children: ReactNode;
}

export interface ResourceRowProps {
  /** 20px lucide icon component. */
  icon?: IconComponent;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  /** Row actions, size="medium" buttons. */
  actions?: ReactNode;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  as?: 'input' | 'select' | 'textarea';
  rows?: number;
  children?: ReactNode;
}

export interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  /** aria-label of the search input. */
  label: string;
}

export interface PageTitleProps {
  /** Supported, but page titles carry no icon by rule. */
  icon?: IconComponent;
  children: ReactNode;
}

export interface SegmentedControlItem {
  value: string;
  label: ReactNode;
  icon?: IconComponent;
  count?: number;
}

export interface SegmentedControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: SegmentedControlItem[];
  className?: string;
}

export interface WorkspaceRailProps {
  /** Label of the current page, e.g. My Board, Chat, NOVA Apps. */
  active?: string;
}

export interface AgentRef {
  id?: string;
  name?: string;
  role?: string;
  character?: string;
}

export interface AgentAvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** The agent, or just its id or name. Mapped to one of 14 roles by src-shared/agent-role.js. */
  agent: AgentRef | string;
  size?: number;
  round?: boolean;
  fill?: boolean;
  /** Overrides the default bot-avatars/<role>.png path. */
  src?: string;
}

export interface ModelPickerProps {
  id?: string;
  /** "inherit" or a model value such as "openai/gpt-6.1-sol". */
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

export interface ProviderLogoProps {
  id: 'github' | 'gitlab' | 'jira' | 'slack' | 'drive' | 'postgres';
}

export declare const Button: ComponentType<ButtonProps>;
export declare function Card(props: CardProps): JSX.Element;
export declare function Badge(props: BadgeProps): JSX.Element;
export declare function FormField(props: FormFieldProps): JSX.Element;
export declare function Dialog(props: DialogProps): JSX.Element;
export declare function DataTable<Row>(props: DataTableProps<Row>): JSX.Element;
export declare function ResourceList(props: ResourceListProps): JSX.Element;
export declare function ResourceRow(props: ResourceRowProps): JSX.Element;
export declare const Input: ComponentType<InputProps>;
export declare const SearchBar: ComponentType<SearchBarProps>;
export declare function PageTitle(props: PageTitleProps): JSX.Element;
export declare function SegmentedControl(props: SegmentedControlProps): JSX.Element;
export declare function WorkspaceRail(props: WorkspaceRailProps): JSX.Element;
/** The account avatar and menu at the bottom of WorkspaceRail. */
export declare function AccountMenu(): JSX.Element;
export declare function AgentAvatar(props: AgentAvatarProps): JSX.Element;
export declare function ModelPicker(props: ModelPickerProps): JSX.Element;
export declare function ProviderLogo(props: ProviderLogoProps): JSX.Element | null;
/** DESIGN.md 6.13: one lucide icon per meaning. */
export declare const Icons: Record<
  'Pencil' | 'Plus' | 'Check' | 'Wallet' | 'ScrollText' | 'Settings' | 'ArrowRight' | 'Globe' | 'ChevronLeft' | 'ChevronRight' |
  'MoreHorizontal' | 'ArrowUpRight' | 'Search' | 'Trash2' | 'Play' | 'RotateCw' | 'Pin' | 'Maximize2' | 'SquareActivity',
  IconComponent
>;
