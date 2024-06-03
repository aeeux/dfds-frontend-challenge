import { format } from "date-fns";
import Head from "next/head";
import Layout from "~/components/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { fetchData } from "~/utils";
import type { ReturnType } from "./api/voyage/getAll";
import { Button } from "~/components/ui/button";
import { TABLE_DATE_FORMAT } from "~/constants";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "~/components/ui/sheet";
import { useState } from "react";
import CreateVoyageForm from "~/components/createVoyageForm";
import { useToast } from "~/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  InvalidateQueryFilters,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export default function Home() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const handleCreateSuccess = () => {
    console.log("handleCreateSuccess called");
    toast({
      title: "Voyage created successfully!",
      description: "The new voyage has been added to the list.",
    });
    setSheetOpen(false);
    queryClient.invalidateQueries(["voyages"] as InvalidateQueryFilters);
    console.log("Voyages query invalidated");
  };

  const { data: voyages } = useQuery<ReturnType>({
    queryKey: ["voyages"],
    queryFn: () => fetchData("voyage/getAll"),
  });

  const mutation = useMutation({
    mutationFn: async (voyageId: string) => {
      const response = await fetch(`/api/voyage/delete?id=${voyageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete the voyage");
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        "voyages",
      ] as InvalidateQueryFilters);
      console.log("Voyage deleted and query invalidated");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete voyage",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error deleting voyage:", error);
    },
  });

  const handleDelete = (voyageId: string) => {
    mutation.mutate(voyageId);
  };

  return (
    <>
      <Head>
        <title>Voyages | DFDS</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" onClick={() => setSheetOpen(true)}>
              Create
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create Voyage</SheetTitle>
              <SheetDescription>
                Fill in the details to create a new voyage. Click save when
                you're done.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <CreateVoyageForm onSuccess={handleCreateSuccess} />
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline" onClick={() => setSheetOpen(false)}>
                  Cancel
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Departure</TableHead>
              <TableHead>Arrival</TableHead>
              <TableHead>Port of loading</TableHead>
              <TableHead>Port of discharge</TableHead>
              <TableHead>Vessel</TableHead>
              <TableHead>Unit Types</TableHead>
              <TableHead>&nbsp;</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {voyages?.map((voyage) => (
              <TableRow key={voyage.id}>
                <TableCell>
                  {format(
                    new Date(voyage.scheduledDeparture),
                    TABLE_DATE_FORMAT,
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(voyage.scheduledArrival), TABLE_DATE_FORMAT)}
                </TableCell>
                <TableCell>{voyage.portOfLoading}</TableCell>
                <TableCell>{voyage.portOfDischarge}</TableCell>
                <TableCell>{voyage.vessel.name}</TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost">{voyage.unitTypes.length}</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Unit Types</h4>
                        <p className="text-sm text-muted-foreground">
                          List of unit types for this voyage:
                        </p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-2">Name</th>
                              <th className="px-4 py-2">Default Length</th>
                            </tr>
                          </thead>
                          <tbody>
                            {voyage.unitTypes.map((unitType) => (
                              <tr key={unitType.id}>
                                <td className="px-4 py-2">{unitType.name}</td>
                                <td className="px-4 py-2">
                                  {unitType.defaultLength}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleDelete(voyage.id)}
                    variant="outline"
                  >
                    X
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Layout>
    </>
  );
}
