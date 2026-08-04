import { useState, type ReactNode } from "react";
import {
  Bell,
  Check,
  CreditCard,
  Loader2,
  Mail,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/shared/model";
import { ThemeToggle } from "@/shared/ui/legacy";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import { Button } from "@/shared/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/shared/ui/button-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/ui/collapsible";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/ui/empty";
import { Field, FieldDescription, FieldLabel } from "@/shared/ui/field";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/shared/ui/hover-card";
import { Input } from "@/shared/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/ui/input-group";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/shared/ui/item";
import { Kbd, KbdGroup } from "@/shared/ui/kbd";
import { Label } from "@/shared/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Progress } from "@/shared/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/sheet";
import { Skeleton } from "@/shared/ui/skeleton";
import { Slider } from "@/shared/ui/slider";
import { Spinner } from "@/shared/ui/spinner";
import { Switch } from "@/shared/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Textarea } from "@/shared/ui/textarea";
import { Toggle } from "@/shared/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

const BRAND_TOKENS = [
  "background",
  "foreground",
  "surface",
  "surface-subtle",
  "surface-tint",
  "card",
  "popover",
  "primary",
  "primary-foreground",
  "primary-soft",
  "primary-tint",
  "primary-tint-strong",
  "secondary",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "border",
  "border-strong",
  "border-accent",
  "border-accent-strong",
  "input",
  "ring",
  "destructive",
  "destructive-soft",
  "destructive-strong",
  "success",
  "success-soft",
  "success-strong",
  "warning",
  "warning-soft",
  "warning-strong",
  "tone-violet-bg",
  "tone-blue-bg",
  "tone-amber-bg",
  "tone-emerald-bg",
  "tone-rose-bg",
  "sidebar",
  "overlay",
  "glass",
];

const NOT_SHOWN = [
  "aspect-ratio",
  "attachment",
  "bubble",
  "calendar",
  "carousel",
  "chart",
  "combobox",
  "context-menu",
  "direction",
  "drawer",
  "form",
  "input-otp",
  "marker",
  "menubar",
  "message",
  "message-scroller",
  "native-select",
  "navigation-menu",
  "resizable",
  "sidebar",
  "sonner",
];

function Section({ id, title, hint, children }: { id: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      </div>
      <div className="rounded-xl border border-border bg-card p-6">{children}</div>
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

export function DesignSystemPage() {
  const { resolved, toggle } = useTheme();
  const [progress, setProgress] = useState(62);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-full overflow-y-auto bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="secondary">shadcn/ui · new-york</Badge>
            <h1 className="text-3xl font-bold tracking-tight">Fokus Design System</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Barcha komponentlar <code className="rounded bg-muted px-1.5 py-0.5 text-xs">@/shared/ui</code> ichida,
              TypeScript'da. Ranglar loyihaning mavjud brend palitrasidan (
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">shared/styles/theme.css</code>) olinadi — shuning
              uchun shadcn ham, eski CSS ham bitta manbadan ishlaydi.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" onClick={toggle}>
              {resolved === "dark" ? <Sun /> : <Moon />}
              {resolved === "dark" ? "Yorug‘ rejim" : "Qorong‘i rejim"}
            </Button>
          </div>
        </header>

        <div className="space-y-10">
          <Section id="tokens" title="Dizayn tokenlari" hint="Light va dark rejimda tekshiring — tepadagi tugma orqali.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {BRAND_TOKENS.map((token) => (
                <div key={token} className="space-y-1.5">
                  <div
                    className="h-14 w-full rounded-lg border border-border"
                    style={{ background: `var(--${token})` }}
                  />
                  <p className="truncate text-xs text-muted-foreground">--{token}</p>
                </div>
              ))}
            </div>
            <Separator className="my-6" />
            <Row>
              {(["sm", "md", "lg", "xl"] as const).map((radius) => (
                <div key={radius} className="space-y-1.5 text-center">
                  <div
                    className="size-16 border border-border bg-primary-soft"
                    style={{ borderRadius: `var(--radius-${radius})` }}
                  />
                  <p className="text-xs text-muted-foreground">radius-{radius}</p>
                </div>
              ))}
            </Row>
          </Section>

          <Section id="button" title="Button" hint="6 variant × 4 o‘lcham + ButtonGroup.">
            <div className="space-y-4">
              <Row>
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </Row>
              <Row>
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon" aria-label="Qo‘shish">
                  <Plus />
                </Button>
              </Row>
              <Row>
                <Button>
                  <Mail /> Xabar yuborish
                </Button>
                <Button disabled>
                  <Loader2 className="animate-spin" /> Yuborilmoqda
                </Button>
                <Button variant="destructive">
                  <Trash2 /> O‘chirish
                </Button>
              </Row>
              <ButtonGroup>
                <Button variant="outline">Kunlik</Button>
                <ButtonGroupSeparator />
                <Button variant="outline">Haftalik</Button>
                <ButtonGroupSeparator />
                <Button variant="outline">Oylik</Button>
              </ButtonGroup>
            </div>
          </Section>

          <Section id="status" title="Badge · Alert · Kbd">
            <div className="space-y-4">
              <Row>
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </Row>
              <Alert>
                <Bell />
                <AlertTitle>Dars 15 daqiqadan keyin boshlanadi</AlertTitle>
                <AlertDescription>Kamera va mikrofoningizni tekshirib qo‘ying.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTitle>Vazifa muddati o‘tdi</AlertTitle>
                <AlertDescription>Topshiriq kech topshirilgan deb belgilanadi.</AlertDescription>
              </Alert>
              <Row>
                <KbdGroup>
                  <Kbd>Ctrl</Kbd>
                  <Kbd>K</Kbd>
                </KbdGroup>
                <span className="text-sm text-muted-foreground">— qidiruvni ochish</span>
              </Row>
            </div>
          </Section>

          <Section id="forms" title="Forma elementlari">
            <div className="grid gap-6 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="ds-login">Login</FieldLabel>
                <Input id="ds-login" placeholder="username" />
                <FieldDescription>Kamida 3 ta belgi.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="ds-search">Qidiruv (InputGroup)</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                  <InputGroupInput id="ds-search" placeholder="O‘quvchi qidirish" />
                </InputGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor="ds-subject">Fan</FieldLabel>
                <Select>
                  <SelectTrigger id="ds-subject">
                    <SelectValue placeholder="Fanni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="math">Matematika</SelectItem>
                    <SelectItem value="physics">Fizika</SelectItem>
                    <SelectItem value="english">Ingliz tili</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="ds-note">Izoh</FieldLabel>
                <Textarea id="ds-note" rows={3} placeholder="Vazifa bo‘yicha ko‘rsatma..." />
              </Field>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="ds-remember" defaultChecked />
                  <Label htmlFor="ds-remember">Meni eslab qolish</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="ds-recording" defaultChecked />
                  <Label htmlFor="ds-recording">Dars yozuviga ruxsat</Label>
                </div>
                <RadioGroup defaultValue="teacher" className="gap-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="teacher" id="ds-r1" />
                    <Label htmlFor="ds-r1">O‘qituvchi</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="parent" id="ds-r2" />
                    <Label htmlFor="ds-r2">Ota-ona</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label>Dars davomiyligi</Label>
                <Slider defaultValue={[45]} max={120} step={5} />
                <Row>
                  <Toggle aria-label="Qalin">B</Toggle>
                  <ToggleGroup type="single" defaultValue="chat" variant="outline">
                    <ToggleGroupItem value="chat">Chat</ToggleGroupItem>
                    <ToggleGroupItem value="lessons">Darslar</ToggleGroupItem>
                    <ToggleGroupItem value="tasks">Vazifalar</ToggleGroupItem>
                  </ToggleGroup>
                </Row>
              </div>
            </div>
          </Section>

          <Section id="feedback" title="Holat va yuklanish">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">AI tekshiruvi</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} />
                <Row>
                  <Button size="sm" variant="outline" onClick={() => setProgress((v) => Math.max(0, v - 10))}>
                    −10
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setProgress((v) => Math.min(100, v + 10))}>
                    +10
                  </Button>
                </Row>
              </div>

              <Row>
                <Spinner />
                <span className="text-sm text-muted-foreground">Yuklanmoqda…</span>
              </Row>

              <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </div>

              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Bell />
                  </EmptyMedia>
                  <EmptyTitle>Hali vazifa berilmagan</EmptyTitle>
                  <EmptyDescription>Birinchi topshiriqni yaratib, o‘quvchilarga yuboring.</EmptyDescription>
                </EmptyHeader>
                <Button size="sm">
                  <Plus /> Vazifa berish
                </Button>
              </Empty>

              <Row>
                <Button variant="outline" onClick={() => toast.success("Vazifa topshirildi")}>
                  Toast: success
                </Button>
                <Button variant="outline" onClick={() => toast.error("Fayl 25 MB dan katta")}>
                  Toast: error
                </Button>
              </Row>
            </div>
          </Section>

          <Section id="overlay" title="Overlay va menyular">
            <Row>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Kursni tahrirlash</DialogTitle>
                    <DialogDescription>Kurs nomi va tavsifini yangilang.</DialogDescription>
                  </DialogHeader>
                  <Field>
                    <FieldLabel htmlFor="ds-course">Kurs nomi</FieldLabel>
                    <Input id="ds-course" defaultValue="Ingliz tili — Intermediate" />
                  </Field>
                  <DialogFooter>
                    <Button variant="outline">Bekor</Button>
                    <Button>Saqlash</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Alert Dialog</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Kursni o‘chirasizmi?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Kurs, chat va unga bog‘liq vazifalar qayta tiklanmaydi.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Bekor</AlertDialogCancel>
                    <AlertDialogAction>O‘chirish</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Suhbat ma’lumotlari</SheetTitle>
                    <SheetDescription>Ishtirokchilar va sozlamalar.</SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Popover</Button>
                </PopoverTrigger>
                <PopoverContent className="w-72">
                  <p className="text-sm text-muted-foreground">
                    Doskada chizish ruxsatini o‘quvchiga berish uchun ismini tanlang.
                  </p>
                </PopoverContent>
              </Popover>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>Diqqat tekshiruvi 15 soniya</TooltipContent>
              </Tooltip>

              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="link">Hover Card</Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-72">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarFallback>MK</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Malika Karimova</p>
                      <p className="text-xs text-muted-foreground">Ingliz tili o‘qituvchisi</p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Dropdown</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Hisobim</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User /> Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard /> To‘lovlar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings /> Sozlamalar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                    <Trash2 /> Chiqish
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Row>
          </Section>

          <Section id="command" title="Command (qidiruv paleti)">
            <Command className="rounded-lg border border-border">
              <CommandInput placeholder="Kurs yoki o‘quvchi qidiring..." />
              <CommandList>
                <CommandEmpty>Natija topilmadi.</CommandEmpty>
                <CommandGroup heading="Kurslar">
                  <CommandItem>
                    <Check /> Ingliz tili — Intermediate
                  </CommandItem>
                  <CommandItem>
                    <Check /> Matematika — 9-sinf
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="O‘quvchilar">
                  <CommandItem>
                    <User /> Aziz Rahimov
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </Section>

          <Section id="navigation" title="Navigatsiya">
            <div className="space-y-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Kurslar</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Ingliz tili</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Vazifalar</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <Tabs defaultValue="chat">
                <TabsList>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="lessons">Darslar</TabsTrigger>
                  <TabsTrigger value="tasks">Vazifalar</TabsTrigger>
                </TabsList>
                <TabsContent value="chat" className="pt-4 text-sm text-muted-foreground">
                  Guruh chati — real-time WebSocket orqali.
                </TabsContent>
                <TabsContent value="lessons" className="pt-4 text-sm text-muted-foreground">
                  Rejalashtirilgan jonli darslar ro‘yxati.
                </TabsContent>
                <TabsContent value="tasks" className="pt-4 text-sm text-muted-foreground">
                  AI tekshiruvidan o‘tgan topshiriqlar.
                </TabsContent>
              </Tabs>

              <Accordion type="single" collapsible>
                <AccordionItem value="a">
                  <AccordionTrigger>Diqqat tekshiruvi qanday ishlaydi?</AccordionTrigger>
                  <AccordionContent>
                    Dars davomida tasodifiy 3–5 marta so‘raladi, javob berishga 15 soniya beriladi.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="b">
                  <AccordionTrigger>Fokus jurnali nima?</AccordionTrigger>
                  <AccordionContent>
                    O‘quvchi oynadan chiqib-kirganda qayd etiladi va ota-onaga ko‘rsatiladi.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Collapsible open={collapsed} onOpenChange={setCollapsed}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm">
                    Qo‘shimcha sozlamalar
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 text-sm text-muted-foreground">
                  Ekran ulashish, doska ruxsati va PDF eksport sozlamalari.
                </CollapsibleContent>
              </Collapsible>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </Section>

          <Section id="data" title="Ma’lumot ko‘rsatish">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Ingliz tili — Intermediate</CardTitle>
                    <CardDescription>Malika Karimova · 24 o‘quvchi</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Haftada 3 marta, jonli dars + AI uy vazifasi tekshiruvi.
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button size="sm">Kursga kirish</Button>
                    <Button size="sm" variant="outline">
                      Tahrirlash
                    </Button>
                  </CardFooter>
                </Card>

                <div className="space-y-2">
                  <Item variant="outline">
                    <ItemMedia>
                      <Avatar>
                        <AvatarFallback>AR</AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>Aziz Rahimov</ItemTitle>
                      <ItemDescription>@aziz · 92 ball</ItemDescription>
                    </ItemContent>
                  </Item>
                  <Item variant="outline">
                    <ItemMedia>
                      <Avatar>
                        <AvatarFallback>SN</AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>Sabina Nazarova</ItemTitle>
                      <ItemDescription>@sabina · 88 ball</ItemDescription>
                    </ItemContent>
                  </Item>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>O‘quvchi</TableHead>
                    <TableHead>Dars</TableHead>
                    <TableHead>Daqiqa</TableHead>
                    <TableHead className="text-right">Diqqat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Aziz Rahimov</TableCell>
                    <TableCell>Present Simple</TableCell>
                    <TableCell>45</TableCell>
                    <TableCell className="text-right">3/3</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Sabina Nazarova</TableCell>
                    <TableCell>Present Simple</TableCell>
                    <TableCell>41</TableCell>
                    <TableCell className="text-right">2/3</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <ScrollArea className="h-40 rounded-lg border border-border p-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  {Array.from({ length: 14 }, (_, index) => (
                    <p key={index}>Fokus jurnali yozuvi #{index + 1} — oynadan chiqdi / qaytdi</p>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </Section>

          <Section
            id="rest"
            title="Sahifada ko‘rsatilmagan komponentlar"
            hint="O‘rnatilgan va ishlatishga tayyor — murakkab demo talab qilgani uchun bu yerga kiritilmadi."
          >
            <Row>
              {NOT_SHOWN.map((name) => (
                <Badge key={name} variant="outline">
                  {name}
                </Badge>
              ))}
            </Row>
          </Section>
        </div>

        <footer className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          Jami 61 ta shadcn komponenti · <code>src/shared/ui/*.tsx</code> · eski primitivlar:{" "}
          <code>src/shared/ui/legacy/</code>
        </footer>
      </div>
    </div>
  );
}
