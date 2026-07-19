using System;
using System.Collections;
using System.IO;
using System.Text;
using BepInEx;
using UnityEngine;

namespace CodexKaibaCardMapping
{
    [BepInPlugin("codex.kaiba.cardmapping", "Kaiba Card Mapping Dumper", "1.0.1")]
    public sealed class KaibaCardMappingDumper : BaseUnityPlugin
    {
        private void Awake()
        {
            StartCoroutine(DumpWhenReady());
        }

        private IEnumerator DumpWhenReady()
        {
            for (var attempt = 0; attempt < 6000; attempt++)
            {
                var inventory = UnityEngine.Object.FindObjectOfType(typeof(InventoryBase)) as InventoryBase;

                if (inventory != null && inventory.m_MonsterData_SO != null &&
                    inventory.m_MonsterData_SO.m_DataList != null &&
                    inventory.m_MonsterData_SO.m_DataList.Count > 0)
                {
                    var output = Path.Combine(Paths.PluginPath, "KaibaCardMapping.csv");
                    using (var writer = new StreamWriter(output, false, new UTF8Encoding(false)))
                    {
                        writer.WriteLine("Index\tOriginalName\tElement\tIconName\tGhostIconName");
                        for (var index = 0; index < inventory.m_MonsterData_SO.m_DataList.Count; index++)
                        {
                            var card = inventory.m_MonsterData_SO.m_DataList[index];
                            if (card == null)
                                continue;

                            writer.Write(index);
                            writer.Write('\t');
                            writer.Write(Clean(card.Name));
                            writer.Write('\t');
                            writer.Write(card.ElementIndex.ToString());
                            writer.Write('\t');
                            writer.Write(card.Icon != null ? Clean(card.Icon.name) : "");
                            writer.Write('\t');
                            writer.Write(card.GhostIcon != null ? Clean(card.GhostIcon.name) : "");
                            writer.WriteLine();
                        }
                    }

                    Logger.LogInfo("CARD_MAPPING_COMPLETE=" + output);
                    yield return new WaitForSeconds(1f);
                    Application.Quit();
                    yield break;
                }

                yield return new WaitForSeconds(0.1f);
            }

            Logger.LogError("CARD_MAPPING_FAILED=Inventory data did not become available");
        }

        private static string Clean(string value)
        {
            return string.IsNullOrEmpty(value)
                ? string.Empty
                : value.Replace("\t", " ").Replace("\r", " ").Replace("\n", " ");
        }
    }
}
